import { PrismaClient, Profile } from "@prisma/client";

/**
 * Get the resources needed to render a profile page.
 *
 * Abstracted so it can be used on multiple pages, for various depths of profiles.
 */
export async function getProfilePage(
  segments: string[],
  prisma: PrismaClient = new PrismaClient(),
) {
  const path: Profile[] = [];
  let lastId: string | null = null;
  for (const segment of segments) {
    const profile: Profile | null = await prisma.profile.findFirst({
      where: {
        slug: segment,
        parentId: lastId,
      },
    });
    if(!profile) {
      throw new Error("404 Not Found");
    }
    // TODO: test permissions at each level
    lastId = profile.id;
    path.push(profile);
  }

  const {
    id,
    slug,
  } = path[path.length - 1];

  return {
    id,
    slug,
  };
}
