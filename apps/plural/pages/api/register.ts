import { RegistrationRequestSchema } from "@plural/schema";
import { PrismaClient } from "@prisma/client";
import { SESSION_OPTIONS } from "../../lib/session";
import { hash } from "bcrypt";
import { withIronSessionApiRoute } from "iron-session/next";
import { customAlphabet } from "nanoid";
import { nolookalikesSafe } from "nanoid-dictionary";
import { NextApiRequest, NextApiResponse } from "next";

const idGenerator = customAlphabet(nolookalikesSafe, 16);
const codeGenerator = customAlphabet(nolookalikesSafe, 8);

export async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const emailEnabled = process.env.EMAIL_ENABLED !== "false";
  const isNoScript = req.query["noscript"] === "true";
  const {
    name,
    email,
    password,
    singlet,
  } = RegistrationRequestSchema.validateSync(req.body);

  const id = idGenerator();
  const code = codeGenerator();

  const hashed = await hash(password, 13);

  const prisma = new PrismaClient();
  const reg = await prisma.emailRegistration.create({
    data: {
      id,
      code,
      name,
      email,
      password: hashed,
      singlet: !!singlet,
    },
  });

  if(!emailEnabled) {
    const user = await prisma.user.create({
      data: {
        singlet: !!singlet,
        password: hashed,
        defaultEmail: email,
      },
    });

    await prisma.email.create({
      data: {
        email,
        userId: user.id,
      },
    });

    await prisma.persona.create({
      data: {
        name,
        userId: user.id,
      },
    });

    req.session.user = {
      id: user.id,
    };
    await req.session.save();
    if(isNoScript) {
      if(singlet) {
        return res.redirect("/app/");
      }
      return res.redirect("/app/front/");
    }
    return res.send({
      id: user.id,
    });
  }

  // TODO: Send email

  if(isNoScript) {
    // TODO: Build page
    return res.redirect("/registration/sent/");
  }
  return res.send({
    status: "ok",
  });
}

export default withIronSessionApiRoute(handler, SESSION_OPTIONS);
