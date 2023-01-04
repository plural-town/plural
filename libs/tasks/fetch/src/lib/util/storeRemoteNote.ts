import { Note } from "@plural-town/activitystreams-validator";
import { PrismaClient } from "@prisma/client";
import { storeRemoteFields } from "./storeRemoteFields";

export async function storeRemoteNote(
  prisma: PrismaClient,
  note: Note | string,
  verified: boolean,
) {
  const url = typeof note === "string" ? note : note.id;

  if (typeof url !== "string" || url.length < 1) {
    throw new Error("Cannot store remote note that does not have an identifying URL.");
  }

  const existing = await prisma.remoteEntity.findUnique({
    where: {
      url,
    },
    include: {
      note: true,
      fields: true,
    },
  });

  if ((existing && existing.protocol !== "ACTIVITYSTREAMS") || existing?.protocol !== "MASTODON") {
    throw new Error(
      "Cannot update a non-ActivityStream/Mastodon profile with ActivityStream data.",
    );
  }

  if (existing && existing.type !== "NOTE") {
    throw new Error("Cannot update a non-note with note data.");
  }

  const entity = existing
    ? existing
    : await prisma.remoteEntity.create({
        data: {
          url,
          protocol: "ACTIVITYSTREAMS",
          type: "NOTE",
        },
        include: {
          note: true,
          fields: true,
        },
      });

  if (note instanceof Note) {
    if (note.name || note.nameMap) {
      await storeRemoteFields(prisma, entity, "NAME", verified, note.name, note.nameMap);
    }

    if (note.content || note.contentMap) {
      await storeRemoteFields(prisma, entity, "CONTENT", verified, note.content, note.contentMap);
    }

    // TODO: store URL - have to potentially unpack 'Link'
    // if(note.url) {
    //   await storeRemoteFields(prisma, entity, "URL", verified, note.url);
    // }

    const postId: string | undefined = undefined;
    if (verified && postId) {
      await prisma.remoteNote.create({
        data: {
          entityId: entity.id,
          postId,
        },
      });
      // TODO: Log
      // TODO: Loop through authors, link
    }

    // TODO: fetch linked entities (insert new tasks)
  }

  return entity;
}
