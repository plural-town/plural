import { QueueWorker } from "./QueueWorker";
import { Job, Queue } from "bullmq";
import { waitForQueue } from "../test/support/waitForQueue";

const connection = {
  host: "localhost",
  port: 6379,
} as const;

describe("QueueWorker", () => {

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let worker: QueueWorker<any, any, string> | undefined;
  let queues: Queue[] = [];

  afterEach(async () => {
    if(worker) {
      await worker.close();
      worker = undefined;
    }
    await Promise.all(queues.map(async (queue) => {
      try {
        await queue.obliterate({ force: true });
      } catch (e) {
        console.error(`Could not obliterate queue ${queue.name}`, e);
      }
      await queue.close();
    }));
    queues = [];
  });

  it("will execute jobs", async () => {
    const processor = jest.fn(() => Promise.resolve("OK"));
    const completed = waitForQueue("test");
    const queue = new Queue("test", { connection });
    queues = [queue];
    worker = new QueueWorker("test", processor, {
      options: {
        connection,
      },
    });

    queue.add("test", 1);
    await completed;
    expect(processor).toBeCalledTimes(1);
  });

  it("can use multiple failure queues", async () => {
    const primary = new Queue("failure", { connection });
    const retry = new Queue("failure_retry", { connection });
    const lastChance = new Queue("failure_last_chance", { connection });
    queues = [primary, retry, lastChance];

    const done = waitForQueue("failure_last_chance");

    const processor = jest.fn((job: Job) => {
      if(job.queueName === "failure_last_chance") {
        return Promise.resolve("ok!");
      }
      return Promise.reject(new Error());
    });

    worker = new QueueWorker("failure", processor, {
      options: { connection },
      retryQueues: [
        { name: "retry", attempts: 2, delay: 10, backoff: 1 },
        { name: "last_chance", attempts: 1, delay: 5, backoff: 1 },
      ],
    });

    primary.add("test", 1, {
      attempts: 2,
      delay: 5,
    });

    await done;

    expect(processor).toHaveBeenCalledTimes(5);
    expect(await primary.getFailedCount()).toBe(1);
    expect(await retry.getFailedCount()).toBe(1);
    expect(await lastChance.getFailedCount()).toBe(0);
    expect(await lastChance.getCompletedCount()).toBe(1);
  });

});
