import { ImportCompleteNoteResponse, ImportCompletePersonResponse, ImportInvalidLoginResponse, ImportInvalidParameterResponse, ImportQueuedResponse, ImportStatusResponse } from "@plural/schema";
import { PrismaClient } from "@prisma/client";
import { SESSION_OPTIONS } from "../../../lib/session";
import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";

export async function importContentStatusHandler(req: NextApiRequest, res: NextApiResponse): Promise<ImportStatusResponse> {
  const users = req.session.users;

  if(!users) {
    const err: ImportInvalidLoginResponse = {
      status: "failure",
      error: "NO_LOGIN",
      nextStep: "LOGIN",
      message: "You can only import a URL if you are a registered user.",
    };
    res.status(401).send(err);
    return;
  }

  const { search } = req.query;

  if(typeof search !== "string") {
    const err: ImportInvalidParameterResponse = {
      status: "failure",
      error: "MISSING_PARAMETER",
      parameter: "search",
    };
    res.status(400).send(err);
    return;
  }

  const prisma = new PrismaClient();
  const complete = await prisma.remoteQuery.findUnique({
    where: {
      id: search,
    },
    include: {
      entity: {
        include: {
          note: true,
          profile: true,
        },
      },
    },
  });

  // START COPY
  // the following is shared with 'import.ts' - move to a common location
  if(complete && complete.entity) {
    const { entity } = complete;
    const baseReply = {
      status: "ok",
      queued: false,
      query: search,
      entityFound: true,
      entityId: entity.id,
    } as const;

    if(entity.type === "PERSON" && entity.profile) {
      // fetched a genuine profile
      const person: ImportCompletePersonResponse = {
        ...baseReply,
        entityType: "PERSON",
        url: `/@${entity.profile.username}@${entity.profile.server}/`,
      };
      res.send(person);
      return person;
    } else if(entity.type === "PERSON") {
      // fetched a profile, but it wasn't verified, so use a generic URL
      const person: ImportCompletePersonResponse = {
        ...baseReply,
        entityType: "PERSON",
        url: `/remote/profile/${entity.id}/`,
      };
      res.send(person);
      return person;
    }

    if(entity.type === "NOTE" && entity.note) {
      // fetched a verified note
      const note: ImportCompleteNoteResponse = {
        ...baseReply,
        entityType: "NOTE",
        // TODO: Use profile?
        url: `/remote/note/${entity.note.id}/`,
      };
      res.send(note);
      return note;
    } else if(entity.type === "NOTE") {
      // fetched a non-verified note, so use a generic URL
      const note: ImportCompleteNoteResponse = {
        ...baseReply,
        entityType: "NOTE",
        url: `/remote/note/${entity.id}/`,
      };
      res.send(note);
      return note;
    }
  }
  // END COPY

  const status: ImportQueuedResponse = {
    status: "ok",
    queued: true,
    query: search,
    job: "",
  };
  res.send(status);
  return status;
}

export default withIronSessionApiRoute(importContentStatusHandler, SESSION_OPTIONS);
