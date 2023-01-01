import { Task } from "@plural-town/queue-core";
import { Queue } from "bullmq";
import { TaskParameters } from "./TaskQueueWorker";

export class TaskQueue<
  Instance extends Task<Instance>,
  NameType extends string = string,
> extends Queue<
  TaskParameters<Parameters<Instance["execute"]>>,
  Awaited<ReturnType<Instance["execute"]>>,
  NameType
> {}
