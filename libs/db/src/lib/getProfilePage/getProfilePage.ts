import { ProfilePage } from "@plural/schema";
import { DisplayName, Identity, Permission, PrismaClient, Profile, ProfileGrant } from "@prisma/client";
import { summarizeProfile } from "../getAccountProfiles/getAccountProfiles";
import { permissionAbove } from "../util/permission-math";

type FullProfile
  = Profile
  & {
    display: DisplayName,
    parent: Profile | null,
    access: ProfileGrant[],
  };

/**
 * Get the resources needed to render a profile page.
 *
 * Abstracted so it can be used on multiple pages, for various depths of profiles.
 */
export async function getProfilePage(
  segments: string[],
  viewers: (string | Identity)[],
  prisma: PrismaClient = new PrismaClient(),
): Promise<ProfilePage> {
  const viewerIds = viewers.map(v => typeof v === "string" ? v : v.id);

  const path: FullProfile[] = [];
  let lastId: string | null = null;
  for (const segment of segments) {
    const profile: FullProfile | null = await prisma.profile.findFirst({
      where: {
        slug: segment,
        parentId: lastId,
      },
      include: {
        display: true,
        parent: true,
        access: {
          where: {
            identityId: {
              in: viewerIds,
            },
          },
        },
      },
    });
    if(!profile) {
      throw new Error("404 Not Found");
    }
    // TODO: test permissions at each level
    lastId = profile.id;
    path.push(profile);
  }

  const profile = path[path.length - 1];

  let permissionLevel: (Permission | "PUBLIC") = "PUBLIC";
  for(const grant of profile.access) {
    const { permission } = grant;
    if(permissionAbove(permission, permissionLevel)) {
      permissionLevel = permission;
    }
    if(permissionLevel === "OWNER") {
      break;
    }
  }

  // TODO: Add "FOLLOWER" to 'permissionLevel'

  const summary = summarizeProfile(profile);

  // TODO: Fetch stats
  // TODO: Check privacy before publishing stats

  const page: ProfilePage = {
    ...summary,
    highestRole: permissionLevel,
    postCount: 0,
    followingCount: 0,
    followerCount: 0,
  };

  return page;
}
