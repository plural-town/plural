import { SESSION_OPTIONS } from "../../../../lib/session";
import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";
import { UpdateDisplaySchema } from "@plural/schema";
import { Permission, PrismaClient } from "@prisma/client";
import flatten from "lodash.flatten";

export async function updateDisplayHandler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { users } = req.session;

  if(!users) {
    throw new Error("Must be logged in.");
  }
  const userIds = users.map(u => u.id);

  const { displayId } = req.query;

  if(typeof displayId !== "string") {
    throw new Error("Malformed display ID.");
  }

  const prisma = new PrismaClient();
  // TODO: Filter using who's fronting or a cached list of identities.
  const existing = await prisma.displayName.findUnique({
    where: {
      id: displayId,
    },
    include: {
      profiles: {
        include: {
          access: {
            where: {
              permission: {
                in: [ Permission.OWNER, Permission.ADMIN, Permission.EDIT ],
              },
            },
            include: {
              identity: {
                include: {
                  grants: {
                    where: {
                      permission: {
                        in: [ Permission.OWNER, Permission.ADMIN ],
                      },
                      accountId: {
                        in: userIds,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  const profiles = (existing?.profiles ?? []);
  const profileGrants = flatten(profiles.map(p => p.access));
  const identities = profileGrants.map(g => g.identity);
  const identityGrants = flatten(identities.map(i => i.grants));

  if(!existing || identityGrants.length < 1) {
    return res.status(404).send({
      status: "failure",
      error: "NOT_FOUND_NO_PERM",
    });
  }

  const {
    name,
    nameVisibility,
    displayName,
    displayNameVisibility,
    bio,
    bioVisibility,
  } = UpdateDisplaySchema.validateSync(req.body);

  await prisma.displayName.update({
    where: {
      id: displayId,
    },
    data: {
      name,
      nameVisibility,
      displayName,
      displayNameVisibility,
      bio,
      bioVisibility,
    },
  });

  return res.send({
    status: "ok",
  });
}

export default withIronSessionApiRoute(updateDisplayHandler, SESSION_OPTIONS);
