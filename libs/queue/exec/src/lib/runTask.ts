import { Task, TaskContext } from "@plural-town/queue-core";
import bunyan from "bunyan";
import { nanoid } from "nanoid";

export interface RunSingleTaskOptions {
  taskName?: string;
  logger?: bunyan;
}

export async function runTask<Instance extends Task<Instance>>(
  TaskInstance: { new (ctx: TaskContext): Instance },
  arg: Parameters<Instance["execute"]>,
  options: RunSingleTaskOptions = {},
): Promise<Awaited<ReturnType<Instance["execute"]>>> {
  const logger =
    options.logger ??
    bunyan.createLogger({
      name: "runTask",
      serializers: bunyan.stdSerializers,
    });

  const taskLogger = logger.child({
    task: options.taskName ?? TaskInstance.name,
    runId: nanoid(),
  });

  const task = new TaskInstance({
    trace: taskLogger.trace.bind(taskLogger),
    warn: taskLogger.warn.bind(taskLogger),
    error: taskLogger.error.bind(taskLogger),
  });
  const result = await task.execute(...arg);
  return result;
}
