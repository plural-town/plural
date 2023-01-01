import { Task } from "@plural-town/queue-core";

export async function runTask<Instance extends Task<Instance>>(
  TaskInstance: { new (): Instance },
  arg: Parameters<Instance["execute"]>,
): Promise<Awaited<ReturnType<Instance["execute"]>>> {
  // TODO: better setup - setup logging, etc.
  const task = new TaskInstance();
  const result = await task.execute(...arg);
  return result;
}
