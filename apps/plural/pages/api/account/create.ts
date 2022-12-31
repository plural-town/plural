import { runTask } from "@plural-town/exec-queue";
import { SendEmailConfirmationCode } from "@plural/email-tasks";
import { getLogger } from "@plural/log";
import { NewEmailRequestSchema } from "@plural/schema";
import { PrismaClient } from "@prisma/client";
import { hash } from "bcrypt";
import { customAlphabet } from "nanoid";
import { nolookalikesSafe } from "nanoid-dictionary";
import { NextApiRequest, NextApiResponse } from "next";

const codeGenerator = customAlphabet(nolookalikesSafe, 6);
const accountGenerator = customAlphabet(nolookalikesSafe, 10);

export async function createAccountHandler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const log = getLogger("createAccountHandler");
  const registrationOpen = process.env.REGISTRATION_ENABLED === "true";
  const emailEnabled = process.env.EMAIL_ENABLED !== "false";
  const {
    email,
    password,
  } = NewEmailRequestSchema.validateSync(req.body);

  if(!registrationOpen) {
    return res.status(500).send({
      status: "failure",
      error: "REG_CLOSED",
    });
  }

  const hashed = await hash(password, 14);

  const prisma = new PrismaClient();

  // TODO: Check for duplicate email (with a verified account)

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

  if(emailEnabled) {
    if(process.env.BACKGROUND !== "true") {
      log.info({ req, res, email }, "Sending confirmation code directly.");
      try {
        const sent = await runTask(SendEmailConfirmationCode, [email, code, `${process.env.BASE_URL}/register/email/confirm/`]);
        log.info({ req, res, email, sent }, "Sent email via SMTP.");
        // TODO: Display "sent" dialog to user
        return res.send({
          status: "ok",
          account: user.id,
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

    // TODO: Queue job

    return res.send({
      status: "ok",
      account: user.id,
      emailSent: "queued",
      // TODO: Include identifier so client can lookup job status
    });
  } else {
    log.info({ req, res, email }, "Email disabled; bypassing sending confirmation code.");
    return res.send({
      status: "ok",
      account: user.id,
      code: auth.code,
    });
  }
}

export default createAccountHandler;
