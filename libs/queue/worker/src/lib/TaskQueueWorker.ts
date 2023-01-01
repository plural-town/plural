import { Task } from "@plural-town/queue-core";
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
> extends QueueWorker<TaskParameters<Parameters<Instance["execute"]>>, Awaited<ReturnType<Instance["execute"]>>, NameType> {

  public constructor(
    name: string,
    private readonly TaskInstance: { new(): Instance },
    opts?: QueueWorkerOptions,
  ) {
    super(
      name,
      (job, token) => this.execute(job, token),
      opts,
    );
  }

  private async execute(
    job: Job<TaskParameters<Parameters<Instance["execute"]>>, Awaited<ReturnType<Instance["execute"]>>, NameType>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    token: string | undefined,
  ): Promise<Awaited<ReturnType<Instance["execute"]>>> {
    console.log(`Executing ${job.name}`);
    const task = new this.TaskInstance();
    const { arg } = job.data;
    const result = await task.execute(...arg);
    return result;
  }

}
