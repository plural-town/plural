import { Permission, PrismaClient } from "@prisma/client";
import flatten from "lodash.flatten";

/**
 * Permissions check to see if the given accounts are allowed
 * to edit the note specified.
 *
 * This should be replaced - the list of (current) identities should
 * be cached in the session (and be limited to who's fronting)
 *
 * @param accountIds The list of user IDs that are in the current session
 * @param noteId The ID for the note that is being accessed
 * @param prisma Database library
 */
export async function canAccountEditNote(
  accountIds: string[],
  noteId: string,
  prisma: PrismaClient = new PrismaClient(),
) {
  const note = await prisma.note.findUnique({
    where: {
      id: noteId,
    },
    include: {
      authors: {
        include: {
          author: {
            include: {
              grants: {
                where: {
                  permission: { in: [ Permission.OWNER, Permission.ADMIN ] },
                  accountId: { in: accountIds },
                },
              },
            },
          },
        },
      },
    },
  });

  const noteAuthors = note?.authors ?? [];
  const identities = noteAuthors.map(a => a.author);
  const grants = flatten(identities.map(i => i.grants));

  if(!note || grants.length < 1) {
    return false;
  }

  return note;
}
