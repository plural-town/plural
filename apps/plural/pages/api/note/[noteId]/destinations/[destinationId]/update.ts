import { SESSION_OPTIONS } from "../../../../../../lib/session";
import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";
import { canAccountEditNote } from "@plural/db";
import { UpdateNoteDestinationSchema } from "@plural/schema";
import { prismaClient } from "@plural/prisma";

export async function updateNoteDestinationHandler(req: NextApiRequest, res: NextApiResponse) {
  const { users } = req.session;
  if (!users) {
    return res.status(401).send({
      status: "failed",
      error: "NO_LOGIN",
    });
  }

  const { localOnly, noteAuthor, privacy } = UpdateNoteDestinationSchema.validateSync(req.body);

  const { noteId, destinationId } = req.query;
  if (typeof noteId !== "string" || typeof destinationId !== "string") {
    throw new Error("Invalid parameter.");
  }

  const prisma = prismaClient();

  const note = await canAccountEditNote(
    users.map((u) => u.id),
    noteId,
    prisma,
  );
  if (!note) {
    return res.status(404).send({
      status: "failure",
      error: "NOT_FOUND_NO_PERM",
      resourceType: "note",
    });
  }

  const item = await prisma.item.findUniqueOrThrow({
    where: {
      id: destinationId,
    },
  });

  await prisma.item.update({
    where: {
      id: item.id,
    },
    data: {
      localOnly,
      noteAuthor,
      privacy,
    },
  });

  return res.send({
    status: "ok",
    id: item.id,
  });
}

export default withIronSessionApiRoute(updateNoteDestinationHandler, SESSION_OPTIONS);
