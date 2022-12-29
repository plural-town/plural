import { PublishedNote } from "@plural/schema";
import { Permission, Prisma, PrismaClient, Profile, Visibility } from "@prisma/client";
import { summarizeProfile } from "../getAccountProfiles/getAccountProfiles";

function privacyFilterForRole(permissionLevel: (Permission | "PUBLIC")): Prisma.EnumVisibilityFilter | Visibility {
  // TODO: Handle system
  // TODO: Handle mutual, followers only
  if(permissionLevel === "PUBLIC") {
    return "PUBLIC";
  }
  if(permissionLevel === "OWNER" || permissionLevel === "ADMIN" || permissionLevel === "EDIT") {
    return { not: "UNLISTED" };
  }
  if(permissionLevel === "VIEW") {
    return {
      notIn: [
        "UNLISTED",
        "SYSTEM",
        "PRIVATE",
      ],
    };
  }
  return "PUBLIC";
}

export async function getProfileFeed(
  profile: Profile,
  permissionLevel: (Permission | "PUBLIC"),
  pageSize = 20,
  offset = 0,
  prisma: PrismaClient = new PrismaClient(),
) {
  // TODO: Can this be cached for performance?

  const items = await prisma.item.findMany({
    where: {
      profileId: profile.id,
      privacy: privacyFilterForRole(permissionLevel),
      publishAt: { not: null },
    },
    take: pageSize,
    skip: offset,
    orderBy: {
      publishAt: "desc",
    },
    include: {
      profile: {
        include: {
          display: true,
          parent: true,
        },
      },
      note: {
        include: {
          publishes: {
            where: {
              // TODO: isn't 'permissionLevel' based on the current user - does it need to be changed when looking up other authors?
              privacy: privacyFilterForRole(permissionLevel),
            },
            include: {
              profile: {
                include: {
                  display: true,
                  parent: true,
                },
              },
            },
          },
          stableDraft: true,
        },
      },
    },
  });

  // TODO: Handle reposts

  const feed: PublishedNote[] = [];
  for (const item of items) {
    if(item.type === "NOTE") {
      // TODO: Handle field permissions
      feed.push({
        id: item.id,
        content: item.note?.stableDraft?.content ?? "",
        profile: {
          ...summarizeProfile(item.profile),
          author: item.noteAuthor ?? "PRIVATE",
        },
        profiles: (item.note?.publishes ?? []).map(item => ({
          ...summarizeProfile(item.profile),
          author: item.noteAuthor ?? "PRIVATE",
        })),
      });
    }
  }

  console.log(JSON.stringify(feed, undefined, 2));

  return feed;
}
