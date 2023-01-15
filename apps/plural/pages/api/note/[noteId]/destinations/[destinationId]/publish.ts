import { SESSION_OPTIONS } from "../../../../../../lib/session";
import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";
import { canAccountEditNote } from "@plural/db";
import { prisma } from "@plural/prisma";

export async function publishNoteHandler(req: NextApiRequest, res: NextApiResponse) {
  const { users } = req.session;
  if (!users) {
    return res.status(401).send({
      status: "failed",
      error: "NO_LOGIN",
    });
  }

  const { noteId, destinationId } = req.query;
  if (typeof noteId !== "string" || typeof destinationId !== "string") {
    throw new Error("Invalid parameter.");
  }

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

  // TODO: make sure latest note draft is published?

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
      publishAt: new Date(),
    },
  });

  return res.send({
    status: "ok",
    id: item.id,
  });
}

export default withIronSessionApiRoute(publishNoteHandler, SESSION_OPTIONS);
