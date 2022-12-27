import { SESSION_OPTIONS } from "../../../lib/session";
import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

export async function frontHandler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const isNoScript = req.query["noscript"] === "true";
  const personaId = req.query.persona;
  const user = req.session.user;

  if(user === undefined) {
    if(isNoScript) {
      return res.redirect("/login/");
    }
    return res.send({
      status: "failure",
      error: "NO_LOGIN",
    });
  }

  const prisma = new PrismaClient();
  // TODO: anonymize not found error
  const persona = await prisma.persona.findUnique({
    where: {
      id: parseInt(personaId, 10),
    },
  });

  if(!persona.userId === user.id) {
    return res.status(404).send("Persona not found");
  }

  req.session.user.persona = persona.id;
  await req.session.save();

  if(isNoScript) {
    return res.redirect("/");
  }
  return res.send({
    status: "ok",
    personaId: persona.id,
  });
}

export default withIronSessionApiRoute(frontHandler, SESSION_OPTIONS);
