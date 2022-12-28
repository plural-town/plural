import { summarizeProfile } from "@plural/db";
import { CreateRootProfileRequestSchema } from "@plural/schema";
import { PrismaClient } from "@prisma/client";
import { SESSION_OPTIONS } from "../../../lib/session";
import { withIronSessionApiRoute } from "iron-session/next";
import { customAlphabet } from "nanoid";
import { nolookalikesSafe } from "nanoid-dictionary";
import { NextApiRequest, NextApiResponse } from "next";

const profileIdGenerator = customAlphabet(nolookalikesSafe, 8);

export async function createProfileHandler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const users = req.session.users;

  if(!users) {
    return res.status(302).send({
      status: "failure",
      error: "NO_LOGIN",
      nextStep: "LOGIN",
    });
  }

  const {
    owner,
    slug,
    display,
    displayId,
    visibility,
  } = CreateRootProfileRequestSchema.validateSync(req.body);

  const prisma = new PrismaClient();
  const identity = await prisma.identity.findUnique({
    where: {
      id: owner,
    },
    include: {
      grants: true,
    },
  });

  const ownership = identity.grants.find(grant => {
    return !!(users.find(u => u.id === grant.accountId));
  });

  if(!ownership) {
    return res.status(301).send({
      status: "failure",
      error: "NO_PERMS",
      nextStep: "LOGIN",
      message: "Cannot create page for an identity that is not logged in.",
    });
  }

  const existing = await prisma.profile.findFirst({
    where: {
      slug,
      parent: null,
    },
  });

  if(existing) {
    return res.status(400).send({
      status: "failure",
      error: "COLLISION",
      nextStep: "CHANGE",
      message: "An identity already exists for the given profile.",
    });
  }

  const displayObj = displayId
    ? await prisma.displayName.findUniqueOrThrow({ where: { id: displayId } })
    : await prisma.displayName.create({
      data: {
        name: display.name,
        nameVisibility: "PUBLIC",
        displayName: display.displayName,
        displayNameVisibility: "PUBLIC",
      },
    });

  const profile = await prisma.profile.create({
    data: {
      id: profileIdGenerator(),
      displayId: displayObj.id,
      visibility,
      slug,
    },
  });

  const grant = await prisma.profileGrant.create({
    data: {
      identityId: owner,
      profileId: profile.id,
      permission: "OWNER",
    },
  });

  return res.send({
    status: "ok",
    profile: summarizeProfile(profile, displayObj),
  });
}

export default withIronSessionApiRoute(createProfileHandler, SESSION_OPTIONS);
