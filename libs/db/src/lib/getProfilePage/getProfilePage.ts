import { ProfilePage } from "@plural/schema";
import { DisplayName, PrismaClient, Profile } from "@prisma/client";
import { summarizeProfile } from "../getAccountProfiles/getAccountProfiles";

type FullProfile
  = Profile
  & {
    display: DisplayName,
    parent: Profile | null,
  };

/**
 * Get the resources needed to render a profile page.
 *
 * Abstracted so it can be used on multiple pages, for various depths of profiles.
 */
export async function getProfilePage(
  segments: string[],
  prisma: PrismaClient = new PrismaClient(),
): Promise<ProfilePage> {
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
      },
    });
    if(!profile) {
      throw new Error("404 Not Found");
    }
    // TODO: test permissions at each level
    lastId = profile.id;
    path.push(profile);
  }

  const summary = summarizeProfile(path[path.length - 1]);

  // TODO: Fetch stats
  // TODO: Check privacy before publishing stats

  const page: ProfilePage = {
    ...summary,
    postCount: 0,
    followingCount: 0,
    followerCount: 0,
  };

  return page;
}
