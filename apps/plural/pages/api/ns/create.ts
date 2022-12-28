import { SESSION_OPTIONS } from "../../../lib/session";
import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { getUser, getUserNS, requireSession } from "@plural/db";
import { CreateNSRequestSchema } from "@plural/schema";

export async function createNsHandler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const noscript = req.query["noscript"] === "true";

  const {
    id,
  } = CreateNSRequestSchema.validateSync(req.body);

  const session = requireSession(req, res);
  if(!session) {
    return;
  }
  const prisma = new PrismaClient();
  const user = await getUser(session, prisma);
  const nsLimit = user.nsLimit ?? parseInt(process.env.USER_DEFAULT_NS_LIMIT, 10);

  const ns = await getUserNS(user, prisma);

  if(ns.length >= nsLimit) {
    if(noscript) {
      throw new Error("You have the maximum number of namespaces.");
    }
    return res.send({
      status: "failure",
      error: "NS_LIMIT",
    });
  }

  const namespace = await prisma.namespace.create({
    data: {
      id,
      userId: user.id,
      // TODO: Allow creating subdomains
      subdomain: false,
    },
  });

  req.session.user.ns = namespace.id;
  await req.session.save();

  if(noscript) {
    return res.redirect("/app/");
  }

  return res.send({
    status: "ok",
    ns: namespace.id,
  });
}

export default withIronSessionApiRoute(createNsHandler, SESSION_OPTIONS);
