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
  const UNIVERSAL_SUBDOMAIN = process.env["UNIVERSAL_SUBDOMAIN"] === "true";
  const HTTP_PROTOCOL = process.env["HTTP_PROTOCOL"];
  const BASE_DOMAIN = process.env["BASE_DOMAIN"];
  const BASE_URL = process.env["BASE_URL"];
  const SUBACCOUNT_CHARACTER = process.env["SUBACCOUNT_CHARACTER"];

  const {
    name,
    displayName,
    bio,
  } = (("display" in profile) ? profile.display : display) ?? {};

  // TODO: Allow for 3+ levels of nesting

  const profileURL = ("parent" in profile && !!profile.parent)
    ? (UNIVERSAL_SUBDOMAIN || profile.parent.subdomain)
      ? `${HTTP_PROTOCOL}://${profile.parent.slug}.${BASE_DOMAIN}/@${profile.slug}/`
      : `${BASE_URL}/@${profile.parent.slug}/@${profile.slug}/`
    : `${BASE_URL}/@${profile.slug}/`;

  const fullUsername = ("parent" in profile && !!profile.parent)
    ? (UNIVERSAL_SUBDOMAIN || profile.parent.subdomain)
      ? `@${profile.slug}@${profile.parent.slug}.${BASE_DOMAIN}`
      : `@${profile.parent.slug}${SUBACCOUNT_CHARACTER}${profile.parent.slug}@${BASE_DOMAIN}`
    : `@${profile.slug}@${BASE_DOMAIN}`;

  return {
    id: profile.id,
    slug: profile.slug,
    fullUsername,
    profileURL,
    parent: profile.parentId,
    isRoot: profile.parentId === null,
    displayId: profile.displayId,
    display: {
      name: name ?? null,
      displayName: displayName ?? null,
      bio: bio ?? null,
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
      permission: { in: [ "OWNER", "ADMIN" ] },
    },
    include: {
      identity: {
        include: {
          profiles: {
            where: {
              permission: { in: [ "OWNER", "ADMIN" ] },
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
