import { SESSION_OPTIONS } from "../../../../lib/session";
import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";
import { abilityForRequest } from "@plural-town/next-ability";
import { param } from "@plural/next-utils";
import { createIdentityDoc, UpdateIdentityDocSchema } from "@plural/schema";
import { permittedFieldsOf } from "@casl/ability/extra";

export async function updateIdentityHandler(req: NextApiRequest, res: NextApiResponse) {
  const id = param(req.query, "identityId", "");
  const update = UpdateIdentityDocSchema.validateSync(req.body);

  const [ability, prisma] = await abilityForRequest(req, {
    baseRequirement: (a) =>
      a.can("update", {
        kind: "Identity",
        id,
      }),
    latest: true,
    ensurePrisma: true,
  });

  if (!ability || !prisma) {
    res.status(404).send({
      status: "failure",
    });
    return;
  }

  const existing = await prisma.identity.findUnique({
    where: {
      id,
    },
    include: {
      display: true,
    },
  });

  const doc = existing ? createIdentityDoc(existing) : undefined;

  if (!existing || !doc || ability.cannot("update", doc)) {
    res.status(404).send({
      status: "failure",
    });
    return;
  }

  const allowedFields = permittedFieldsOf(ability, "update", doc, {
    fieldsFrom: (rule) => rule.fields || Object.keys(update),
  });

  const forbidden = Object.keys(update).filter((k) => !allowedFields.includes(k));
  if (forbidden.length > 0) {
    res.status(401).send({
      status: "failure",
      error: "MISSING_PERMISSION_FOR_FIELDS",
      action: "update",
      fields: forbidden,
    });
    return;
  }

  await prisma.identity.update({
    where: {
      id: existing.id,
    },
    data: {
      role: update.role,
    },
  });

  res.send({
    status: "ok",
  });
}

export default withIronSessionApiRoute(updateIdentityHandler, SESSION_OPTIONS);
