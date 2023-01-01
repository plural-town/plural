/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import * as express from "express";
import * as path from "path";
import { BullMQAdapter, createBullBoard, ExpressAdapter } from "@bull-board/express";
import { environment } from "./environments/environment";
import { TaskQueue } from "@plural-town/queue-worker";
import { SendEmailConfirmationCode } from "@plural/email-tasks";

const { connection } = environment;

const sendEmailConfirmationCode = new TaskQueue<SendEmailConfirmationCode>(
  "sendEmailConfirmationCode",
  { connection },
);

const serverAdapter = new ExpressAdapter();

const { addQueue } = createBullBoard({
  queues: [
    new BullMQAdapter(sendEmailConfirmationCode),
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
