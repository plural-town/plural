import { runTask } from "@plural-town/exec-queue";
import { TaskQueue } from "@plural-town/queue-worker";
import { SendDuplicateRegistrationEmail, SendEmailConfirmationCode } from "@plural/email-tasks";
import { getLogger } from "@plural/log";
import { prismaClient } from "@plural/prisma";
import { NewEmailRequestSchema } from "@plural/schema";
import { hash } from "bcrypt";
import { customAlphabet } from "nanoid";
import { nolookalikesSafe } from "nanoid-dictionary";
import { NextApiRequest, NextApiResponse } from "next";

const codeGenerator = customAlphabet(nolookalikesSafe, 6);
const accountGenerator = customAlphabet(nolookalikesSafe, 10);

export async function createAccountHandler(req: NextApiRequest, res: NextApiResponse) {
  const log = getLogger("createAccountHandler");
  const registrationOpen = process.env.REGISTRATION_ENABLED === "true";
  const emailEnabled = process.env.EMAIL_ENABLED !== "false";
  const { email, password } = NewEmailRequestSchema.validateSync(req.body);

  if (!registrationOpen) {
    return res.status(500).send({
      status: "failure",
      error: "REG_CLOSED",
    });
  }

  const hashed = await hash(password, 14);

  const prisma = prismaClient();

  const existingVerified = await prisma.email.findFirst({
    where: {
      email,
      verifiedAt: { not: null },
    },
  });

  if (existingVerified) {
    log.info({ req, res, email }, "User attempted to register with a duplicate email.");
    if (!emailEnabled) {
      // "break the fourth wall" - can't email about a duplicate registration,
      // so assume we can relax security a little to let the user know.
      // TODO: Display warning in UI
      return res.send({
        status: "warning",
        error: "DUPLICATE_REGISTRATION",
      });
    }

    if (process.env.BACKGROUND === "true") {
      const queue = new TaskQueue<SendDuplicateRegistrationEmail>(
        "sendDuplicateRegistrationEmail",
        {
          connection: {
            host: process.env.REDIS_HOST,
            port: parseInt(process.env.REDIS_PORT, 10),
          },
        },
      );
      const job = await queue.add(`duplicate_${email}`, {
        arg: [email],
      });
      await queue.close();

      return res.send({
        status: "ok",
        emailSent: "queued",
        jobId: job.id,
      });
    }

    try {
      const sent = await runTask(SendDuplicateRegistrationEmail, [email]);
      res.send({
        status: "ok",
        emailSent: "complete",
      });
      log.trace({ req, res, email, sent }, "Sent duplicate email warning via SMTP");
      return;
    } catch (err) {
      res.status(500).send({
        status: "failure",
        error: "EMAIL_PROVIDER_FAILED",
      });
      log.error({ req, res, email, err }, "Failed to send duplicate email warning via SMTP.");
      return;
    }
  }

  const user = await prisma.account.create({
    data: {
      id: accountGenerator(),
      password: hashed,
    },
  });

  const code = codeGenerator();
  const auth = await prisma.email.create({
    data: {
      email,
      code,
      accountId: user.id,
    },
  });

  if (emailEnabled) {
    if (process.env.BACKGROUND !== "true") {
      log.trace({ req, res, email }, "Sending confirmation code directly.");
      try {
        const sent = await runTask(SendEmailConfirmationCode, [
          email,
          code,
          `${process.env.BASE_URL}/register/email/confirm/`,
        ]);
        log.info({ req, res, email, sent }, "Sent email via SMTP.");
        // TODO: Display "sent" dialog to user
        return res.send({
          status: "ok",
          emailSent: "complete",
        });
      } catch (err) {
        // TODO: Handle error on client
        res.status(500).send({
          status: "failure",
          error: "EMAIL_PROVIDER_FAILED",
        });
        log.error({ req, res, email, err }, "Failed to send email via SMTP.");
        return;
      }
    }

    log.info({ req, res, email }, "Using job queue to send confirmation code.");
    const queue = new TaskQueue<SendEmailConfirmationCode>("sendEmailConfirmationCode", {
      connection: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT, 10),
      },
    });
    const job = await queue.add(`confirmation${email}`, {
      arg: [email, code, `${process.env.BASE_URL}/register/email/confirm/`],
    });
    await queue.close();

    return res.send({
      status: "ok",
      emailSent: "queued",
      jobId: job.id,
    });
  } else {
    log.info({ req, res, email }, "Email disabled; bypassing sending confirmation code.");
    return res.send({
      status: "ok",
      code: auth.code,
    });
  }
}

export default createAccountHandler;
