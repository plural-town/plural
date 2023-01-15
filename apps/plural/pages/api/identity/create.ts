import { CreateIdentityRequestSchema } from "@plural/schema";
import { SESSION_OPTIONS } from "../../../lib/session";
import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";
import { customAlphabet } from "nanoid";
import { nolookalikesSafe } from "nanoid-dictionary";
import { prisma } from "@plural/prisma";

const identityIdGenerator = customAlphabet(nolookalikesSafe, 8);

export async function createIdentityHandler(req: NextApiRequest, res: NextApiResponse) {
  const { users } = req.session;

  if (!users) {
    return res.status(302).send({
      status: "failure",
      error: "NO_LOGIN",
      nextStep: "LOGIN",
    });
  }

  const userIds = users.map((u) => u.id);

  const { accountId, name, displayName } = CreateIdentityRequestSchema.validateSync(req.body);

  if (!userIds.includes(accountId)) {
    return res.status(301).send({
      status: "failure",
      error: "NO_PERMS",
      nextStep: "LOGIN",
      message: "Cannot create identity for an account that is not logged in.",
    });
  }

  const display = await prisma.displayName.create({
    data: {
      name,
      nameVisibility: "PUBLIC",
      displayName,
      displayNameVisibility: "PUBLIC",
    },
  });

  const identity = await prisma.identity.create({
    data: {
      id: identityIdGenerator(),
      displayId: display.id,
    },
  });

  const grant = await prisma.identityGrant.create({
    data: {
      accountId,
      identityId: identity.id,
      permission: "OWNER",
    },
  });

  return res.send({
    status: "ok",
    identity: {
      id: identity.id,
      display,
      grant: {
        permission: grant.permission,
      },
    },
  });
}

export default withIronSessionApiRoute(createIdentityHandler, SESSION_OPTIONS);
