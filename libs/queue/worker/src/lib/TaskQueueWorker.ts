import { Task, TaskContext } from "@plural-town/queue-core";
import { Job } from "bullmq";
import { QueueWorker, QueueWorkerOptions } from "./QueueWorker";

export interface TaskParameters<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Arguments extends any[],
> {
  arg: Arguments;
}

export class TaskQueueWorker<
  Instance extends Task<Instance>,
  NameType extends string = string,
> extends QueueWorker<
  TaskParameters<Parameters<Instance["execute"]>>,
  Awaited<ReturnType<Instance["execute"]>>,
  NameType
> {
  public constructor(
    name: string,
    private readonly TaskInstance: { new (ctx: TaskContext): Instance },
    opts?: QueueWorkerOptions,
  ) {
    super(name, (job, token) => this.execute(job, token), opts);
  }

  private async execute(
    job: Job<
      TaskParameters<Parameters<Instance["execute"]>>,
      Awaited<ReturnType<Instance["execute"]>>,
      NameType
    >,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    token: string | undefined,
  ): Promise<Awaited<ReturnType<Instance["execute"]>>> {
    this.bunyan.trace({ job }, "Executing Task");
    const logger = this.bunyan.child({
      task: this.TaskInstance.name,
      queueName: job.queueName,
      runId: job.id,
    });
    const task = new this.TaskInstance({
      error: logger.error.bind(logger),
      trace: logger.trace.bind(logger),
      warn: logger.warn.bind(logger),
    });
    const { arg } = job.data;
    const result = await task.execute(...arg);
    return result;
  }
}
