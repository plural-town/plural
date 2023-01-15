import { SESSION_OPTIONS } from "../../../lib/session";
import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";
import { InitialPromotionRequestSchema } from "@plural/schema";
import { Role } from "@prisma/client";
import { getLogger } from "@plural/log";
import { prisma } from "@plural/prisma";

export async function promoteInitialAdminHandler(req: NextApiRequest, res: NextApiResponse) {
  const log = getLogger("promoteInitialAdminHandler");
  const TOKEN = process.env.ADMIN_PROMOTE_TOKEN;
  const EMAIL = process.env.ADMIN_PROMOTE_EMAIL;
  const IDENT = process.env.ADMIN_PROMOTE_IDENTITY;

  const noPromotionMethod =
    (!TOKEN || TOKEN.length < 1) && (!EMAIL || EMAIL.length < 1) && (!IDENT || IDENT.length < 1);

  if (process.env.ADMIN_PROMOTION !== "true" || noPromotionMethod) {
    const err = {
      status: "failure",
      error: "PROMOTION_DISABLED",
    };
    res.status(405).send(err);
    return;
  }

  const { users } = req.session;

  if (!users) {
    const err = {
      status: "failure",
      error: "NO_LOGIN",
    };
    res.status(401).send(err);
    return;
  }
  const userIds = users.map((u) => u.id);

  const { identity, token } = InitialPromotionRequestSchema.validateSync(req.body);

  const i = await prisma.identity.findUnique({
    where: {
      id: identity,
    },
    include: {
      grants: {
        where: {
          accountId: { in: userIds },
          permission: { in: ["OWNER", "ADMIN"] },
        },
        include: {
          account: {
            include: {
              emails: true,
            },
          },
        },
      },
    },
  });

  const grant = (i?.grants ?? []).find((g) => userIds.includes(g.accountId));
  const emails = grant?.account.emails.map((e) => e.email) ?? [];

  if (!i || !grant) {
    const err = {
      status: "failure",
      error: "NOT_FOUND",
      missing: "IDENTITY",
    };
    res.status(404).send(err);
    log.info(
      { req, res },
      "Rejecting initial promotion: user attempted to promote an identity they are not logged in to.",
    );
    return;
  }

  const NOT_PERMITTED = {
    status: "failure",
    error: "NOT_PERMITTED",
  };

  if (TOKEN && TOKEN.length > 0 && TOKEN !== token) {
    res.status(403).send(NOT_PERMITTED);
    log.warn({ req, res }, "Rejecting initial promotion: user submitted an incorrect token.");
    return;
  }

  if (IDENT && IDENT.length > 0) {
    const allowed = IDENT.split(",").map((i) => i.trim());
    if (!allowed.includes(i.id)) {
      res.status(403).send(NOT_PERMITTED);
      log.warn(
        { req, res, identityId: i.id },
        "Rejecting initial promotion: identity is not on the list of allowed identities.",
      );
      return;
    }
  }

  if (EMAIL && EMAIL.length > 0) {
    const allowed = EMAIL.split(",").map((i) => i.trim());
    const match = emails.map((e) => allowed.includes(e));
    if (!match) {
      res.status(403).send(NOT_PERMITTED);
      log.warn(
        { req, res, emails },
        "Rejecting initial promotion: user not logged in with an approved email address.",
      );
      return;
    }
  }

  const updated = await prisma.identity.update({
    where: {
      id: i.id,
    },
    data: {
      role: Role.OWNER,
    },
  });

  const ok = {
    status: "ok",
  };
  res.send(ok);
  log.info({ req, res, updated }, "Promoted initial administrator.");
}

export default withIronSessionApiRoute(promoteInitialAdminHandler, SESSION_OPTIONS);
