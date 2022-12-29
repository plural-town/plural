import { SESSION_OPTIONS } from "../../../../../lib/session";
import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { canAccountEditNote } from "@plural/db";

export async function publishDraftHandler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { users } = req.session;
  if(!users) {
    throw new Error("Not logged in.");
  }

  const { draftId } = req.query;
  if(typeof draftId !== "string") {
    throw new Error("Invalid draft ID parameter.");
  }

  const prisma = new PrismaClient();

  const draft = await prisma.noteDraft.findUnique({
    where: {
      id: draftId,
    },
  });

  const note = await canAccountEditNote(users.map(u => u.id), draft?.noteId ?? "", prisma);
  if(!note) {
    throw new Error("You do not have permission to access this note.");
  }

  await prisma.note.update({
    where: {
      id: note.id,
    },
    data: {
      stableId: draftId,
    },
  });

  return res.send({
    status: "ok",
  });
}

export default withIronSessionApiRoute(publishDraftHandler, SESSION_OPTIONS);
