import path = require("path");
import * as dotenv from "dotenv";
dotenv.config({
  path: path.join(__dirname, "../../../apps/plural/.env.local"),
});
dotenv.config({
  path: path.join(__dirname, "../../../apps/plural/.env"),
});
import { TaskQueueWorker, TaskServer } from "@plural-town/queue-worker";
import { connection } from "./environments/environment";

import {
  SendEmailConfirmationCode,
} from "@plural/email-tasks";
import { Duration } from "luxon";

const sendEmailConfirmationCode = new TaskQueueWorker("sendEmailConfirmationCode", SendEmailConfirmationCode, {
  primaryOptions: {
    connection,
    concurrency: 10,
  },
  retryQueues: [
    {
      name: "retry",
      attempts: 5,
      delay: 5 * 60 * 1000,
      backoff: {
        type: "exponential",
        delay: Duration.fromObject({ minutes: 15 }),
      },
      options: {
        connection,
        concurrency: 5,
      },
    },
    {
      name: "last_chance",
      attempts: 5,
      delay: Duration.fromObject({ hours: 4 }),
      backoff: {
        type: "exponential",
        delay: Duration.fromObject({ hours: 6 }),
      },
      options: {
        connection,
        concurrency: 2,
      },
    },
  ],
});

const server = new TaskServer([
  sendEmailConfirmationCode,
]);
server.printWorkers();
