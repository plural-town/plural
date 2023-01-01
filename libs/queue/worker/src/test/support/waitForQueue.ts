import { QueueEvents } from "bullmq";

export interface WaitForQueueOptions {
  /**
   * Resolve after this number of completed jobs.
   * Defaults to `1`.
   *
   * Set to `0` to not resolve after any completed jobs.
   */
  completed?: number;
  allowFailure?: boolean;
}

export function waitForQueue(
  queueName: string,
  options: WaitForQueueOptions | number = 1,
  events: QueueEvents = new QueueEvents(queueName, {
    connection: {
      host: "localhost",
      port: 6379,
    },
  }),
) {
  const opt = typeof options !== "number" ? options : {
    completed: options,
  };
  return new Promise<void>((resolve, reject) => {
    let finished = false;
    let completed = 0;
    events.on("completed", () => {
      if(finished) {
        return;
      }
      completed += 1;
      if(opt.completed !== 0 && completed === (opt.completed ?? 1)) {
        finished = true;
        events.removeAllListeners();
        events.close();
        resolve();
      }
    });
    if(opt.allowFailure !== true) {
      events.on("failed", (job) => {
        if(finished) {
          return;
        }
        finished = true;
        events.removeAllListeners();
        events.close();
        reject(new Error(`Job '${job.jobId}' failed: ${job.failedReason}`));
      });
    }
  });
}
