import { Person } from "@plural-town/activitystreams-validator";
import { PrismaClient } from "@prisma/client";
import { storeRemoteFields } from "./storeRemoteFields";

export async function storeRemotePerson(
  prisma: PrismaClient,
  profile: Person | string,
  verified: boolean,
) {
  const url = typeof profile === "string" ? profile : profile.id;

  if (typeof url !== "string" || url.length < 1) {
    throw new Error("Cannot store remote profile that does not have an identifying URL.");
  }

  const existing = await prisma.remoteEntity.findUnique({
    where: {
      url,
    },
    include: {
      profile: true,
      fields: true,
    },
  });

  if (existing && existing.protocol !== "ACTIVITYSTREAMS" && existing.protocol !== "MASTODON") {
    throw new Error(
      "Cannot update a non-ActivityStream/Mastodon profile with ActivityStream data.",
    );
  }

  if (existing && existing.type !== "PERSON") {
    throw new Error("Cannot update a non-profile with profile data.");
  }

  const entity = existing
    ? existing
    : await prisma.remoteEntity.create({
        data: {
          url,
          protocol: "ACTIVITYSTREAMS",
          type: "PERSON",
        },
        include: {
          profile: true,
          fields: true,
        },
      });

  if (profile instanceof Person) {
    if (profile.name || profile.nameMap) {
      await storeRemoteFields(prisma, entity, "NAME", verified, profile.name, profile.nameMap);
    }

    if (profile.summary || profile.summaryMap) {
      await storeRemoteFields(
        prisma,
        entity,
        "SUMMARY",
        verified,
        profile.summary,
        profile.summaryMap,
      );
    }

    if (profile.preferredUsername || profile.preferredUsernameMap) {
      await storeRemoteFields(
        prisma,
        entity,
        "PREFERRED_USERNAME",
        verified,
        profile.preferredUsername,
        profile.preferredUsernameMap,
      );
    }

    // TODO: store URL (need to unpack 'Link')
    // if(profile.url) {
    //   await storeRemoteFields(prisma, entity, "URL", verified, profile.url);
    // }

    const username = profile.preferredUsernameMap?.["en"] ?? profile.preferredUsername;

    if (verified && !entity.profile && username && profile.id) {
      const url = new URL(profile.id);

      await prisma.remoteProfile.create({
        data: {
          entityId: entity.id,
          server: url.hostname,
          username,
        },
      });
    }

    // TODO: Insert tasks to fetch any linked entities
  }

  return entity;
}
