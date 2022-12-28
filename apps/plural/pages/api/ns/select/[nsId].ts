import { getNamespace, requireSession } from "@plural/db";
import { PrismaClient } from "@prisma/client";
import { SESSION_OPTIONS } from "../../../../lib/session";
import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";

export async function selectNamespaceHandler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const noscript = req.query["noscript"] === "true";
  const { nsId } = req.query;
  if(!nsId || typeof nsId !== "string") {
    throw new Error("Must provide namespace ID.");
  }
  const session = requireSession(req, res);
  if(!session) { return; }

  const prisma = new PrismaClient();
  const ns = await getNamespace(nsId, session, prisma);

  req.session.user.ns = ns.id;
  await req.session.save();

  if(noscript) {
    return res.redirect("/app/");
  }
  return res.send({
    status: "ok",
    ns: ns.id,
  });
}

export default withIronSessionApiRoute(selectNamespaceHandler, SESSION_OPTIONS);
