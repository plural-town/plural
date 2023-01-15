import { abilityForRequest, FrontSession } from "@plural-town/next-ability";
import { ActivateIdentityRequestSchema } from "@plural/schema";
import { SESSION_OPTIONS } from "../../../../lib/session";
import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";
import { getLogger } from "@plural/log";

export async function activateIdentity(req: NextApiRequest, res: NextApiResponse) {
  const log = getLogger("activateIdentity");
  const { replace, identity } = ActivateIdentityRequestSchema.validateSync(req.body);

  const [ability, prisma] = await abilityForRequest(req, {
    baseRequirement: (a) =>
      a.can("activate", {
        kind: "Identity",
        id: identity,
      }),
    latest: true,
    ensurePrisma: true,
    allIdentities: true,
  });

  const found = !prisma
    ? undefined
    : await prisma.identity.findUnique({
        where: {
          id: identity,
        },
        include: {
          grants: true,
          display: true,
          profiles: true,
        },
      });

  if (!ability || !prisma || !found) {
    res.status(404).send({
      status: "failure",
    });
    log.warn(
      { req, res, identity, ability: !!ability, prisma: !!prisma, found: !!found },
      "Unable to activate identity",
    );
    return;
  }

  if (req.session.front && req.session.front.find((i) => i.id === identity) && !replace) {
    res.status(409).send({
      status: "noop",
    });
    return;
  }

  const accountIds = (req.session.users ?? []).map((u) => u.id);
  const owner = found.grants.find(
    (g) => g.permission === "OWNER" && accountIds.includes(g.accountId),
  );

  const existing = replace ? [] : req.session.front ?? [];

  const front: FrontSession[] = [
    ...existing,
    {
      id: found.id,
      name:
        found.display && found.display.displayName.length > 0
          ? found.display.displayName
          : found.display.name,
      role: found.role,
      account: owner?.id,
      profiles: found.profiles.map((p) => ({
        profileId: p.profileId,
        permission: p.permission,
      })),
      at: Date.now(),
    },
  ];
  req.session.front = front;
  await req.session.save();

  res.send({
    status: "ok",
  });
  return;
}

export default withIronSessionApiRoute(activateIdentity, SESSION_OPTIONS);
