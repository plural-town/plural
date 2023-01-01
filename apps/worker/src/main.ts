import path = require("path");
import * as dotenv from "dotenv";
dotenv.config({
  path: path.join(__dirname, "../../../apps/plural/.env.local"),
});
dotenv.config({
  path: path.join(__dirname, "../../../apps/plural/.env"),
});
import { TaskQueueWorker } from "@plural-town/queue-worker";
import { connection } from "./environments/environment";

import {
  SendEmailConfirmationCode,
} from "@plural/email-tasks";

new TaskQueueWorker("sendEmailConfirmationCode", SendEmailConfirmationCode, {
  primaryOptions: {
    connection,
    concurrency: 10,
  },
  retryQueues: [
    {
      name: "retry",
      attempts: 2,
      delay: 5 * 60 * 1000,
      backoff: {
        type: "exponential",
        delay: 60 * 1000,
      },
      options: {
        connection,
        concurrency: 5,
      },
    },
    {
      name: "last_chance",
      attempts: 5,
      delay: 60 * 60 * 1000,
      backoff: {
        type: "exponential",
        delay: 20 * 60 * 1000,
      },
      options: {
        connection,
        concurrency: 2,
      },
    },
  ],
});
