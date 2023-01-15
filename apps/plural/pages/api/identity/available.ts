import { SESSION_OPTIONS } from "../../../lib/session";
import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { getAccountIdentities } from "@plural/db";
import flatten from "lodash.flatten";

export async function availableIdentitiesHandler(req: NextApiRequest, res: NextApiResponse) {
  const { users } = req.session;

  if (!users) {
    return res.status(302).send({
      status: "failure",
      error: "NO_LOGIN",
      nextStep: "LOGIN",
    });
  }

  const userIds = users.map((u) => u.id);
  const prisma = new PrismaClient();

  const identities = flatten(
    await Promise.all(userIds.map((id) => getAccountIdentities(id, prisma))),
  );

  res.send({
    status: "ok",
    identities,
  });
}

export default withIronSessionApiRoute(availableIdentitiesHandler, SESSION_OPTIONS);
