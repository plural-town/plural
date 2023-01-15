import { SESSION_OPTIONS } from "../../../../../lib/session";
import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";
import { UpdateNoteContentSchema } from "@plural/schema";
import { canAccountEditNote } from "@plural/db";
import { prismaClient } from "@plural/prisma";

export async function updateNoteDraftHandler(req: NextApiRequest, res: NextApiResponse) {
  const { users } = req.session;
  if (!users) {
    throw new Error("Not logged in.");
  }

  const { draftId } = req.query;
  if (typeof draftId !== "string") {
    throw new Error("Invalid draft ID parameter.");
  }

  const { content } = UpdateNoteContentSchema.validateSync(req.body);

  const prisma = prismaClient();

  const draft = await prisma.noteDraft.findUnique({
    where: {
      id: draftId,
    },
  });

  // TODO: Test permissions
  const note = await canAccountEditNote(
    users.map((u) => u.id),
    draft?.noteId ?? "",
    prisma,
  );
  if (!note) {
    throw new Error("You do not have permission to access this note.");
  }

  // TODO: Prevent changing a published draft

  await prisma.noteDraft.update({
    where: {
      id: draftId,
    },
    data: {
      content,
    },
  });

  return res.send({
    status: "ok",
  });
}

export default withIronSessionApiRoute(updateNoteDraftHandler, SESSION_OPTIONS);
