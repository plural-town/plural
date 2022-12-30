import { createProfileURL } from "@plural/db";
import { getLogger } from "@plural/log";
import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

function nonempty(val: string) {
  if (val.length > 0) {
    return val;
  }
  return null;
}

export default async function actorHandler(req: NextApiRequest, res: NextApiResponse) {
  const log = getLogger("apActor");

  const BASE_DOMAIN = process.env.BASE_DOMAIN;
  const { profileId } = req.query;

  if (typeof profileId !== "string") {
    res.status(500).send("Failed to process query.");
    log.error({ req, res }, "User endpoint failed to parse 'profileId'");
    return;
  }

  const prisma = new PrismaClient();

  const profile = await prisma.profile.findUnique({
    where: {
      id: profileId,
    },
    include: {
      display: true,
      parent: true,
    },
  });

  if (!profile) {
    res.status(404).send({});
    log.warn({ req, res, profileId }, "User requested unknown profile.");
    return;
  }

  const activity = req.headers.accept.includes("application/activity+json");
  const ld = req.headers.accept.includes("application/ld+json");

  if (!activity && !ld) {
    res.redirect(createProfileURL(profile));
    log.info({ req, res, profileId, accept: req.headers.accept }, "Redirecting non-API to profile");
    return;
  }

  // TODO: Handle profile visibility/privacy

  res.send({
    "@context": ["https://www.w3.org/ns/activitystreams", "https://w3id.org/security/v1"],

    id: `https://${BASE_DOMAIN}/api/ap/profile/${profileId}`,
    type: "Person",
    preferredUsername: profile.slug,
    name: nonempty(profile.display.displayName) ?? nonempty(profile.display.name) ?? profile.slug,
    summary: profile.display.bio,
    url: createProfileURL(profile),
    inbox: `https://${BASE_DOMAIN}/api/ap/inbox`,

    publicKey: {
      id: `https://${BASE_DOMAIN}/api/ap/profile/${profileId}#main-key`,
      owner: `https://${BASE_DOMAIN}/api/ap/profile/${profileId}`,
      // TODO: Generate PEM
      // TODO: Return PEM
      publicKeyPem: "",
    },
  });
  log.trace({ req, res }, "Handled actor page.");
}
