import { SESSION_OPTIONS } from "../../../lib/session";
import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";
import {
  ImportCompleteNoteResponse,
  ImportCompletePersonResponse,
  ImportInvalidLoginResponse,
  ImportInvalidResponse,
  ImportQueuedResponse,
  ImportRequestSchema,
  ImportResponse,
} from "@plural/schema";
import { TaskQueue } from "@plural-town/queue-worker";
import { runTask } from "@plural-town/exec-queue";
import { getLogger } from "@plural/log";
import { QueryURL } from "@plural/tasks/fetch";
import { prismaClient } from "@plural/prisma";

export async function importContentHandler(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<ImportResponse> {
  const log = getLogger("importContentHandler");
  const users = req.session.users;

  if (!users) {
    const err: ImportInvalidLoginResponse = {
      status: "failure",
      error: "NO_LOGIN",
      nextStep: "LOGIN",
      message: "You can only import a URL if you are a registered user.",
    };
    res.status(401).send(err);
    return err;
  }

  const { url } = ImportRequestSchema.validateSync(req.body);

  // TODO: Rate-limit users (for extreme cases)
  // TODO: Have some way of blocklisting URLs
  // TODO: Check cache for recently imported content

  // TODO: Track/log who queued this query (for analytics, moderation, and so users can see complete/outstanding jobs)

  const prisma = prismaClient();

  const query = await prisma.remoteQuery.create({
    data: {
      url,
      status: "PENDING",
    },
  });

  if (process.env.BACKGROUND === "true") {
    const queue = new TaskQueue("queryURL", {
      connection: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT, 10),
      },
    });
    const job = await queue.add(`query${query.id}`, {
      arg: [url, query.id],
    });
    await queue.close();

    const queued: ImportQueuedResponse = {
      status: "ok",
      queued: true,
      query: query.id,
      job: job.id,
    };
    res.send(queued);
    return queued;
  } else {
    await runTask(QueryURL, [url, query.id], {
      logger: log,
    });

    const complete = await prisma.remoteQuery.findUnique({
      where: {
        id: query.id,
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

    if (complete && complete.entity) {
      const { entity } = complete;
      const baseReply = {
        status: "ok",
        queued: false,
        query: query.id,
        entityFound: true,
        entityId: entity.id,
      } as const;

      if (entity.type === "PERSON" && entity.profile) {
        // fetched a genuine profile
        const person: ImportCompletePersonResponse = {
          ...baseReply,
          entityType: "PERSON",
          url: `/@${entity.profile.username}@${entity.profile.server}/`,
        };
        res.send(person);
        return person;
      } else if (entity.type === "PERSON") {
        // fetched a profile, but it wasn't verified, so use a generic URL
        const person: ImportCompletePersonResponse = {
          ...baseReply,
          entityType: "PERSON",
          url: `/remote/profile/${entity.id}/`,
        };
        res.send(person);
        return person;
      }

      if (entity.type === "NOTE" && entity.note) {
        // fetched a verified note
        const note: ImportCompleteNoteResponse = {
          ...baseReply,
          entityType: "NOTE",
          // TODO: Use profile?
          url: `/remote/note/${entity.note.id}/`,
        };
        res.send(note);
        return note;
      } else if (entity.type === "NOTE") {
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

    const reply: ImportInvalidResponse = {
      status: "ok",
      queued: false,
      query: query.id,
      entityFound: false,
    };
    res.send(reply);
    return reply;
  }
}

export default withIronSessionApiRoute(importContentHandler, SESSION_OPTIONS);
