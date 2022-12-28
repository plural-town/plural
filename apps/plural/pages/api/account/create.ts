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
  const emailEnabled = process.env.EMAIL_ENABLED !== "false";
  const {
    email,
    password,
  } = NewEmailRequestSchema.validateSync(req.body);

  const hashed = await hash(password, 14);

  const prisma = new PrismaClient();

  // TODO: Check for duplicate email (with a verified account)

  const user = await prisma.account.create({
    data: {
      id: accountGenerator(),
      password: hashed,
    },
  });

  const auth = await prisma.email.create({
    data: {
      email,
      code: codeGenerator(),
      accountId: user.id,
    },
  });

  if(emailEnabled) {
    // TODO: Send email
    return res.send({
      status: "ok",
      account: user.id,
    });
  } else {
    return res.send({
      status: "ok",
      account: user.id,
      code: auth.code,
    });
  }
}

export default createAccountHandler;
