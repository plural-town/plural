import { SESSION_OPTIONS } from "../../../../../lib/session";
import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";
import { canAccountEditNote, getAccountProfiles } from "@plural/db";
import { PrismaClient } from "@prisma/client";
import { AddNoteDestinationSchema } from "@plural/schema";
import flatten from "lodash.flatten";

export async function addNoteDestinationHandler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { users } = req.session;
  if(!users) {
    return res.status(401).send({
      status: "failed",
      error: "NO_LOGIN",
    });
  }

  const { noteId } = req.query;
  if(typeof noteId !== "string") {
    throw new Error("Invalid note ID parameter.");
  }

  const {
    localOnly,
    noteAuthor,
    privacy,
    profileId,
  } = AddNoteDestinationSchema.validateSync(req.body);

  const prisma = new PrismaClient();

  const profiles = flatten(await Promise.all(users.map(u => getAccountProfiles(u.id, prisma))));
  const profile = profiles.find(p => p.id === profileId);

  if(!profile) {
    return res.status(404).send({
      status: "failure",
      error: "NOT_FOUND_NO_PERM",
      resourceType: "profile",
    });
  }

  const note = await canAccountEditNote(users.map(u => u.id), noteId, prisma);
  if(!note) {
    return res.status(404).send({
      status: "failure",
      error: "NOT_FOUND_NO_PERM",
      resourceType: "note",
    });
  }

  // TODO: Prevent duplicate destinations

  const item = await prisma.item.create({
    data: {
      profileId,
      localOnly,
      privacy,
      type: "NOTE",
      noteId,
      noteAuthor,
    },
  });

  return res.send({
    status: "ok",
    itemId: item.id,
  });
}

export default withIronSessionApiRoute(addNoteDestinationHandler, SESSION_OPTIONS);
