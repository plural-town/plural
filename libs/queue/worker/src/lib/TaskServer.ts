import { Duration } from "luxon";
import { QueueWorker } from "./QueueWorker";

class AttemptTableRow {
  public readonly sinceStart: string;
  public readonly Delay: string;
  public constructor(
    public readonly Attempt: number,
    sinceStart: Duration,
    public readonly Queue: string,
    delayed: Duration,
  ) {
    this.sinceStart = sinceStart.rescale().toHuman({
      unitDisplay: "short",
    });
    this.Delay = delayed.rescale().toHuman({
      unitDisplay: "narrow",
    });
  }
}

export class TaskServer {
  public constructor(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private readonly workers: QueueWorker<any, any, string>[],
  ) {}

  public printWorkers() {
    for (const worker of this.workers) {
      const { name, opts } = worker;
      console.info(`\n==== ${name} Queue ====`);
      let _delay = Duration.fromMillis(0);
      let attempt = 1;
      const table: AttemptTableRow[] = [new AttemptTableRow(attempt, _delay, "Primary", _delay)];
      const { retryQueues } = opts ?? {};
      for (const queue of retryQueues ?? []) {
        const { name, attempts, delay, backoff } = queue;
        let roundDelay = Duration.fromMillis(0);
        for (let i = 0; i < (attempts ?? 1); i++) {
          if (i === 0) {
            roundDelay = Duration.isDuration(delay) ? delay : Duration.fromMillis(delay ?? 0);
          } else if (typeof backoff === "object" && backoff.type === "fixed") {
            roundDelay = Duration.isDuration(backoff.delay)
              ? backoff.delay
              : Duration.fromMillis(backoff.delay ?? 0);
          } else if (typeof backoff === "object" || typeof backoff === "number") {
            const durationValue = typeof backoff === "object" ? backoff.delay : backoff;
            const backoffDuration = Duration.isDuration(durationValue)
              ? durationValue
              : Duration.fromMillis(durationValue ?? 0);
            const ms = backoffDuration.toMillis();
            const scaled = Math.pow(2, i - 1) * ms;
            const backoffTime = Duration.fromMillis(scaled);
            roundDelay = backoffTime;
          }
          _delay = _delay.plus(roundDelay);
          table.push(new AttemptTableRow(++attempt, _delay, name, roundDelay));
        }
      }
      console.table(table, ["sinceStart", "Attempt", "Queue", "Delay"]);
    }
  }
}
