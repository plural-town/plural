import { DisplaySummary, ProfileSummary } from "@plural/schema";
import { Account, DisplayName, PrismaClient, Profile } from "@prisma/client";
import flatten from "lodash.flatten";

export function summarizeProfile(
  profile: Profile & { display: DisplayName },
): ProfileSummary;
export function summarizeProfile(
  profile: Profile,
  display: DisplaySummary,
): ProfileSummary;
export function summarizeProfile(
  profile: Profile | (Profile & { display: DisplayName }),
  display?: DisplaySummary,
): ProfileSummary {
  const {
    name,
    displayName,
  } = (("display" in profile) ? profile.display : display) ?? {};

  return {
    id: profile.id,
    slug: profile.slug,
    displayId: profile.displayId,
    display: {
      name,
      displayName,
    },
    visibility: profile.visibility,
  };
}

export async function getAccountProfiles(
  account: string | Account,
  prisma: PrismaClient = new PrismaClient(),
): Promise<ProfileSummary[]> {
  const accountId = typeof account === "string" ? account : account.id;

  const grants = await prisma.identityGrant.findMany({
    where: {
      accountId,
    },
    include: {
      identity: {
        include: {
          profiles: {
            include: {
              profile: {
                include: {
                  display: true,
                },
              },
            },
          },
        },
      },
    },
  });

  const identities = grants.map(g => g.identity);
  const profileGrants = flatten(identities.map(i => i.profiles));
  const profiles = profileGrants.map(g => g.profile);
  return profiles.map(profile => summarizeProfile(profile));
}
