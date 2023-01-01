/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import * as express from "express";
import * as path from "path";
import { BullMQAdapter, createBullBoard, ExpressAdapter } from "@bull-board/express";
import { environment } from "./environments/environment";
import { Queue } from "bullmq";

const { connection } = environment;

function retryQueues(
  name: string,
  ...retryQueues: string[]
) {
  const primary = new Queue(name, { connection });
  const retries = retryQueues.map(q => new Queue(`${name}_${q}`, { connection }));
  const queues = [primary, ...retries];
  const adapted = queues.map(q => new BullMQAdapter(q));
  return [adapted, queues] as const;
}

const [sendEmailConfirmationCode] = retryQueues("sendEmailConfirmationCode", "retry", "last_chance");

const [sendDuplicateRegistrationEmail] = retryQueues("sendDuplicateRegistrationEmail", "retry", "last_chance");

const serverAdapter = new ExpressAdapter();

createBullBoard({
  queues: [
    ...sendEmailConfirmationCode,
    ...sendDuplicateRegistrationEmail,
  ],
  serverAdapter,
});

const app = express();

app.use(serverAdapter.getRouter());

app.use("/assets", express.static(path.join(__dirname, "assets")));

const port = process.env.port || 3333;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});
server.on("error", console.error);
