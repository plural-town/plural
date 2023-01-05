import path = require("path");
import { loadEnvConfig } from "@next/env";

loadEnvConfig(path.join(__dirname, "../../../apps/plural"));

import { TaskQueueWorker, TaskServer } from "@plural-town/queue-worker";
import { connection } from "./environments/environment";

import { SendDuplicateRegistrationEmail, SendEmailConfirmationCode } from "@plural/email-tasks";
import { Duration } from "luxon";
import { QueryURL } from "@plural/tasks/fetch";

const sendEmailConfirmationCode = new TaskQueueWorker(
  "sendEmailConfirmationCode",
  SendEmailConfirmationCode,
  {
    primaryOptions: {
      connection,
      concurrency: 5,
      limiter: {
        max: 20,
        duration: Duration.fromObject({ minute: 1 }).toMillis(),
      },
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
          concurrency: 2,
          limiter: {
            max: 20,
            duration: Duration.fromObject({ minutes: 15 }).toMillis(),
          },
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
          concurrency: 1,
          limiter: {
            max: 100,
            duration: Duration.fromObject({ hours: 1 }).toMillis(),
          },
        },
      },
    ],
  },
);

const sendDuplicateRegistrationEmail = new TaskQueueWorker(
  "sendDuplicateRegistrationEmail",
  SendDuplicateRegistrationEmail,
  {
    primaryOptions: {
      concurrency: 2,
      connection,
      limiter: {
        max: 10,
        duration: Duration.fromObject({ minute: 1 }).toMillis(),
      },
    },
    retryQueues: [
      {
        name: "retry",
        attempts: 9,
        delay: Duration.fromObject({ minutes: 5 }),
        backoff: {
          type: "exponential",
          delay: Duration.fromObject({ minutes: 10 }),
        },
        options: {
          connection,
          concurrency: 1,
          limiter: {
            max: 5,
            duration: Duration.fromObject({ minute: 1 }).toMillis(),
          },
        },
      },
      {
        name: "last_chance",
        attempts: 10,
        delay: Duration.fromObject({ hours: 12 }),
        backoff: {
          type: "fixed",
          delay: Duration.fromObject({ hours: 12 }),
        },
        options: {
          connection,
          concurrency: 1,
          limiter: {
            max: 5,
            duration: Duration.fromObject({ minutes: 10 }).toMillis(),
          },
        },
      },
    ],
  },
);

const queryURL = new TaskQueueWorker("queryURL", QueryURL, {
  primaryOptions: {
    concurrency: 10,
    connection,
    limiter: {
      max: 120,
      duration: Duration.fromObject({ minutes: 1 }).toMillis(),
    },
  },
  retryQueues: [
    {
      name: "retry",
      attempts: 10,
      delay: Duration.fromObject({ minutes: 1 }),
      backoff: {
        type: "exponential",
        delay: Duration.fromObject({ minutes: 4 }),
      },
      options: {
        connection,
        concurrency: 5,
        limiter: {
          max: 60,
          duration: Duration.fromObject({ minutes: 1 }).toMillis(),
        },
      },
    },
    {
      name: "last_chance",
      attempts: 14,
      delay: Duration.fromObject({ days: 1 }),
      backoff: {
        type: "fixed",
        delay: Duration.fromObject({ days: 2 }).toMillis(),
      },
      options: {
        connection,
        concurrency: 2,
        limiter: {
          max: 5,
          duration: Duration.fromObject({ minutes: 1 }).toMillis(),
        },
      },
    },
  ],
});

const server = new TaskServer([
  sendEmailConfirmationCode,
  sendDuplicateRegistrationEmail,
  queryURL,
]);
server.printWorkers();
