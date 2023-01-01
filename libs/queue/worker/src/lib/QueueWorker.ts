import { BackoffOptions, Job, Processor, Queue, RedisConnection, UnrecoverableError, Worker, WorkerOptions } from "bullmq";
import { Duration } from "luxon";

export interface RetryQueueBackoffOptions extends Omit<BackoffOptions, "delay"> {
  delay?: number | Duration;
}

export interface RetryQueueOptions {
  name: string;
  attempts?: number;
  delay?: number | Duration;
  backoff?: number | RetryQueueBackoffOptions;
  options?: WorkerOptions;
}

export interface QueueWorkerOptions {
  /**
   * A Redis connection that will be used for all queue workers.
   */
  connection?: typeof RedisConnection;

  /**
   * Default options for all workers.
   * Use {@link primaryOptions} to override options for the first (non-retry) worker,
   * and {@link RetryQueueOptions.options} to override these options for a retry worker.
   */
  options?: WorkerOptions;

  /**
   * Specific options for the first worker.
   * If not provided, {@link options} will be used.
   */
  primaryOptions?: WorkerOptions;

  retryQueues?: RetryQueueOptions[];
}

export class QueueWorker<DataType, ResultType, NameType extends string> {

  private readonly primary: Worker<DataType, ResultType, NameType>;
  private readonly retry: Worker<DataType, ResultType, NameType>[];
  private readonly retryQueues: Queue<DataType, ResultType, NameType>[];

  public constructor(
    public readonly name: string,
    private readonly processor: Processor<DataType, ResultType, NameType>,
    public readonly opts?: QueueWorkerOptions,
  ) {
    const retryQueues = opts?.retryQueues ?? [];
    this.primary = new Worker<DataType, ResultType, NameType>(
      name,
      retryQueues.length > 0
        ? (job, token) => this.process(job, token, this.retryQueues[0], retryQueues[0])
        : (job, token) => this.process(job, token),
      opts?.primaryOptions ?? opts?.options,
      opts?.connection,
    );
    this.retry = retryQueues.map((retryQueueOptions, i) => {
      return new Worker<DataType, ResultType, NameType>(
        `${name}_${retryQueueOptions.name}`,
        (retryQueues.length > i)
          ? (job, token) => this.process(job, token, this.retryQueues[i + 1], retryQueues[i + 1])
          : (job, token) => this.process(job, token),
        retryQueueOptions.options ?? opts?.options,
        opts?.connection,
      );
    });
    this.retryQueues = retryQueues.map((retryQueueOptions) => {
      return new Queue<DataType, ResultType, NameType>(
        `${name}_${retryQueueOptions.name}`,
        retryQueueOptions.options ?? opts?.options,
        opts?.connection,
      );
    });
  }

  private async process(
    job: Job<DataType, ResultType, NameType>,
    token: string | undefined,
    nextQueue?: Queue<DataType, ResultType, NameType>,
    nextQueueOptions?: RetryQueueOptions,
  ) {
    try {
      return await this.processor(job, token);
    } catch (e) {
      if(e instanceof UnrecoverableError) {
        throw e;
      }
      if(job.attemptsMade >= (job.opts.attempts ?? 0)) {
        if(nextQueue && nextQueueOptions) {
          await nextQueue.add(job.name, job.data, {
            attempts: nextQueueOptions.attempts,
            delay: Duration.isDuration(nextQueueOptions.delay) ? nextQueueOptions.delay.toMillis() : nextQueueOptions.delay,
            backoff: typeof nextQueueOptions.backoff === "object"
              ? {
                type: nextQueueOptions.backoff.type,
                delay: Duration.isDuration(nextQueueOptions.backoff.delay) ? nextQueueOptions.backoff.delay.toMillis() : nextQueueOptions.backoff.delay,
              } : nextQueueOptions.backoff,
          });
          throw e;
        }
      }
      throw e;
    }
  }

  public async close() {
    return Promise.all([
      this.primary.close(),
      ...(this.retry.map(r => r.close())),
      ...(this.retryQueues.map(r => r.close())),
    ]);
  }

}
