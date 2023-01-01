import { Task } from "@plural-town/queue-core";
import { Queue } from "bullmq";
import { waitForQueue } from "../test/support/waitForQueue";
import { TaskQueue } from "./TaskQueue";
import { TaskQueueWorker } from "./TaskQueueWorker";

const connection = {
  host: "localhost",
  port: 6379,
} as const;

class TestTask extends Task<TestTask> {
  public async execute(name: string): Promise<string> {
    return `Hello ${name}`;
  }
}

describe("TaskQueueWorker", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let worker: TaskQueueWorker<any> | undefined;
  let queues: Queue[] = [];

  afterEach(async () => {
    if (worker) {
      await worker.close();
      worker = undefined;
    }
    await Promise.all(
      queues.map(async (queue) => {
        await queue.obliterate();
        await queue.close();
        await queue.disconnect();
      }),
    );
    queues = [];
  });

  it("can run jobs", async () => {
    worker = new TaskQueueWorker("task_test", TestTask, {
      options: { connection },
    });
    const queue = new TaskQueue<TestTask>("task_test", { connection });
    const done = waitForQueue("task_test");
    queues = [queue];

    await new Promise((res) => setTimeout(res, 100));

    await queue.add("job", { arg: ["Jay Doe"] });

    await done;
    expect(await queue.getJobCounts()).toStrictEqual({
      active: 0,
      completed: 1,
      delayed: 0,
      failed: 0,
      paused: 0,
      waiting: 0,
      "waiting-children": 0,
    });

    await new Promise((res) => setTimeout(res, 200));
  });
});
