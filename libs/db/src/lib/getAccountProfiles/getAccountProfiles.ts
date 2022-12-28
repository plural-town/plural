import { DisplaySummary, ProfileSummary } from "@plural/schema";
import { Account, DisplayName, PrismaClient, Profile } from "@prisma/client";
import flatten from "lodash.flatten";
import uniq from "lodash.uniq";

export function summarizeProfile(
  profile: Profile & { display: DisplayName, parent?: Profile | null },
): ProfileSummary;
export function summarizeProfile(
  profile: Profile,
  display: DisplaySummary,
): ProfileSummary;
export function summarizeProfile(
  profile: Profile | (Profile & { display: DisplayName, parent?: Profile | null }),
  display?: DisplaySummary,
): ProfileSummary {
  const BASE_URL = process.env["BASE_URL"];

  const {
    name,
    displayName,
  } = (("display" in profile) ? profile.display : display) ?? {};

  // TODO: Allow for 3+ levels of nesting
  // TODO: Format subdomains if applicable

  const profileURL = ("parent" in profile && !!profile.parent)
    ? `${BASE_URL}/@${profile.parent.slug}/@${profile.slug}/`
    : `${BASE_URL}/@${profile.slug}/`;

  return {
    id: profile.id,
    slug: profile.slug,
    profileURL,
    parent: profile.parentId,
    isRoot: profile.parentId === null,
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
                  parent: true,
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
  const profiles: (Profile & { display: DisplayName })[]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    = (uniq as any)(profileGrants.map(g => g.profile), (p: Profile) => p.id);
  return profiles.map(profile => summarizeProfile(profile));
}
