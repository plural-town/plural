import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

export default async function actorHandler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const BASE_DOMAIN = process.env.BASE_DOMAIN;
  const { profileId } = req.query;

  if(typeof profileId !== "string") {
    throw new Error("Malformed profile ID.");
  }

  const prisma = new PrismaClient();

  const profile = await prisma.profile.findUnique({
    where: {
      id: profileId,
    },
  });

  if(!profile) {
    return res.status(404).send({});
  }

  // TODO: Handle profile visibility/privacy

  return {
    "@context": [
      "https://www.w3.org/ns/activitystreams",
      "https://w3id.org/security/v1",
    ],

    id: `https://${BASE_DOMAIN}/api/ap/profile/${profileId}`,
    type: "Person",
    preferredUsername: profile.slug,
    inbox: `https://${BASE_DOMAIN}/api/ap/inbox`,

    publicKey: {
      id: `https://${BASE_DOMAIN}/api/ap/profile/${profileId}#main-key`,
      owner: `https://${BASE_DOMAIN}/api/ap/profile/${profileId}`,
      // TODO: Generate PEM
      // TODO: Return PEM
      publicKeyPem: "",
    },
  };
}
