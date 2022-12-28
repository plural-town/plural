import { SESSION_OPTIONS } from "../../../lib/session";
import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";
import { CreateNoteRequestSchema } from "@plural/schema";
import { PrismaClient } from "@prisma/client";
import { customAlphabet } from "nanoid";
import { nolookalikesSafe } from "nanoid-dictionary";

const noteIdGenerator = customAlphabet(nolookalikesSafe, 16);

export async function startDraftHandler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { users } = req.session;

  if(!users) {
    return res.status(302).send({
      status: "failure",
      error: "NO_LOGIN",
      nextStep: "LOGIN",
    });
  }
  const userIds = users.map(u => u.id);

  const {
    identities,
  } = CreateNoteRequestSchema.validateSync(req.body);

  const prisma = new PrismaClient();

  for (const identityId of Object.keys(identities)) {
    const identity = await prisma.identity.findUnique({
      where: {
        id: identityId,
      },
      include: {
        grants: true,
      },
    });

    const grant = identity.grants.find(grant => userIds.includes(grant.accountId));
    if(!grant) {
      return res.status(301).send({
        status: "failure",
        error: "NO_PERMS",
        nextStep: "LOGIN",
        message: "Cannot send message as an identity that you are not logged in as.",
      });
    }
  }

  const note = await prisma.note.create({
    data: {
      id: noteIdGenerator(),
    },
  });

  for(const identityId of Object.keys(identities)) {
    await prisma.noteAuthor.create({
      data: {
        noteId: note.id,
        authorId: identityId,
      },
    });
  }

  const draft = await prisma.noteDraft.create({
    data: {
      noteId: note.id,
      content: "",
    },
  });

  return res.send({
    status: "ok",
    note: note.id,
    draft: draft.id,
  });
}

export default withIronSessionApiRoute(startDraftHandler, SESSION_OPTIONS);