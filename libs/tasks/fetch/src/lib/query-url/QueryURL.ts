import { ASObject, Note, Person } from "@plural-town/activitystreams-validator";
import { Task } from "@plural-town/queue-core";
import { prismaClient } from "@plural/prisma";
import { PrismaClient, RemoteEntity } from "@prisma/client";
import axios, { AxiosResponse } from "axios";
import {
  ClassType,
  transformAndValidate,
  TransformValidationOptions,
} from "class-transformer-validator";
import { getFieldValues } from "../util/getFieldValue";
import { storeRemoteNote } from "../util/storeRemoteNote";
import { storeRemotePerson } from "../util/storeRemotePerson";

/**
 * Request an unknown URL and determine if any parsable content exists.
 *
 * Jobs are tracked as {@link RemoteQuery},
 * and valid entities found will be stored as {@link RemoteEntity}.
 *
 * Mostly used when users type a URL into the search bar.
 */
export class QueryURL extends Task<QueryURL> {
  public fetch(url: string) {
    return axios.get(url, {
      headers: {
        Accept: "application/activity+json",
        // TODO: Send actual version (and mention forks, e.g. "Mastodon/4.0.2+glitch")
        "User-Agent": "PluralTown/1.0.0",
      },
    });
  }

  public async parse(response: AxiosResponse) {
    const anyActivityStreamObject = await this.attemptTransform(ASObject, response.data);
    if (anyActivityStreamObject) {
      const profile = await this.attemptTransform(Person, response.data);
      if (profile) {
        return profile;
      }
      const user = await this.attemptTransform(Note, response.data);
      if (user) {
        return user;
      }
      throw new Error(
        `Unable to parse ActivityStream entity '${anyActivityStreamObject.type}' returned from remote server`,
      );
    }
    throw new Error("Unparsable response received from remote server.");
  }

  public client() {
    return prismaClient();
  }

  public storeRemotePerson(...args: Parameters<typeof storeRemotePerson>) {
    return storeRemotePerson(...args);
  }

  public storeRemoteNote(...args: Parameters<typeof storeRemoteNote>) {
    return storeRemoteNote(...args);
  }

  public async updateRemoteQuery(prisma: PrismaClient, queryId: string, entity: RemoteEntity) {
    const existing = await prisma.remoteQuery.findUnique({
      where: {
        id: queryId,
      },
    });
    if (!existing) {
      this.error(
        { entity },
        "QueryURL ran before a RemoteQuery was created - this is unsupported.",
      );
      return existing;
    }
    if (!existing.entityId || existing.entityId !== entity.id) {
      if (existing.entityId) {
        this.warn({ entity }, "Unexpected change in entity found at query URL");
      }
      return await prisma.remoteQuery.update({
        where: {
          id: queryId,
        },
        data: {
          entityId: entity.id,
        },
      });
    }
    return existing;
  }

  public override async execute(url: string, queryId: string) {
    const fetchedFrom = new URL(url).hostname;
    const res = await this.fetch(url);
    const data = await this.parse(res);
    const prisma = this.client();

    let entity: RemoteEntity | undefined;

    if (data instanceof Note) {
      if (!data.id) {
        throw new Error("Cannot import a Note that does not have an ID.");
      }
      const noteDomain = new URL(data.id).hostname;
      const attributedTo = getFieldValues(data.attributedTo, true, [Person]);
      await Promise.all(
        attributedTo.map((author) => {
          const authorURL = typeof author === "string" ? author : author.id;
          const authorDomain = new URL(authorURL ?? "").hostname;
          const verified = authorDomain === fetchedFrom;
          return this.storeRemotePerson(prisma, author, verified);
        }),
      );

      const verified = noteDomain === fetchedFrom;
      entity = await this.storeRemoteNote(prisma, data, verified);
      this.trace({ url, entity }, "Created Note fetched from remote ActivityStreams server");
    }
    if (data instanceof Person) {
      if (!data.id) {
        throw new Error("Cannot import a Person that does not have an ID.");
      }
      const domain = new URL(data.id).hostname;
      const verified = domain === fetchedFrom;
      entity = await this.storeRemotePerson(prisma, data, verified);
      this.trace({ url, entity }, "Created Person fetched from remote ActivityStreams server");
    }

    if (entity) {
      this.updateRemoteQuery(prisma, queryId, entity);
    }
  }

  protected async attemptTransform<T extends object>(
    classType: ClassType<T>,
    json: string,
    options?: TransformValidationOptions,
  ) {
    try {
      const transformed = await transformAndValidate(classType, json, options);
      return Array.isArray(transformed) ? false : transformed;
    } catch (err) {
      return false;
    }
  }
}
