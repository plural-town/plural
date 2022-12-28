import { NewEmailRequestSchema } from "@plural/schema";
import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

export async function confirmEmail(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { email, password } = NewEmailRequestSchema.validateSync(req.body);

  const prisma = new PrismaClient();
  const auth = await prisma.email.findFirst({
    where: {
      email,
      code: password,
      verifiedAt: null,
    },
  });

  if(!auth) {
    throw new Error("Email not found");
  }

  await prisma.email.update({
    where: {
      id: auth.id,
    },
    data: {
      verifiedAt: new Date(),
    },
  });

  return res.send({
    status: "ok",
  });
}

export default confirmEmail;
