import { Permission, PrismaClient } from "@prisma/client";
import { abilityFor, PluralTownAbility, PluralTownRule, rulesFor } from "@plural-town/ability";
import uniqBy from "lodash.uniqby";
import isEqual from "lodash.isequal";
import { FrontSession } from "./FrontSession";
import { UserSession } from "./UserSession";
import { ActiveIdentity } from "@plural-town/acl-models";
import { DateTime, Duration } from "luxon";
import { IncomingMessage } from "http";

export type RequestWithSession = IncomingMessage & {
  session: {
    save: () => Promise<void>;
    users?: UserSession[];
    front?: FrontSession[];
  };
};

export interface AbilityForRequestOptions {
  /**
   * If `true`, bypass any caching on permissions/roles.
   */
  latest?: boolean;

  maxSessionCache?: Duration;

  /**
   * By default, if {@link RequestWithSession.session.front} is set, only the active identities
   * will be used to build the permissions.
   *
   * Set {@link allIdentities} to true to evaluate based on all identities available.
   */
  allIdentities?: boolean;
  baseRequirement?: (ability: PluralTownAbility) => boolean;
  prisma?: PrismaClient;
  ensurePrisma?: boolean;
  ensureUser?: boolean;
}

type ReturnedPrismaClient<O extends AbilityForRequestOptions> = O extends { prisma: PrismaClient }
  ? PrismaClient
  : O extends { ensurePrisma: true }
  ? PrismaClient
  : PrismaClient | undefined;

export async function abilityForRequest<Options extends AbilityForRequestOptions>(
  req: RequestWithSession,
  options?: Options,
): Promise<
  | Readonly<[false, false, false]>
  | Readonly<[PluralTownAbility, ReturnedPrismaClient<Options>, PluralTownRule[]]>
> {
  const { users, front } = req.session;
  const maxSessionCache = options?.maxSessionCache ?? Duration.fromObject({ minutes: 1 });

  if (!users && !front) {
    const base = abilityFor(rulesFor([]));
    if (options?.ensureUser) {
      return [false, false, false] as const;
    }
    if (options?.baseRequirement && !options?.baseRequirement(base)) {
      return [false, false, false] as const;
    }
  }

  if (front && Array.isArray(front) && front.length > 0 && options?.allIdentities !== true) {
    const identities: ActiveIdentity[] = [];
    let prisma: PrismaClient | undefined = options?.prisma;
    let sessionUpdated = false;

    for (const session of front) {
      const { id } = session;
      const at = DateTime.fromMillis(session.at);
      const cachedAgo = DateTime.now().diff(at);
      if (
        session.role &&
        session.profiles &&
        options?.latest !== true &&
        cachedAgo < maxSessionCache
      ) {
        identities.push({
          id,
          role: session.role,
          profiles: session.profiles,
        });
        continue;
      }

      if (!prisma) {
        prisma = new PrismaClient();
      }

      const identity = await prisma.identity.findUnique({
        where: {
          id,
        },
        include: {
          grants: true,
          profiles: true,
        },
      });

      if (!identity) {
        // TODO: Log/return a discriminative value
        return [false, false, false] as const;
      }

      const profiles = identity.profiles.map((p) => ({
        profileId: p.profileId,
        permission: p.permission,
      }));

      identities.push({
        id: identity.id,
        role: identity.role,
        profiles,
      });

      const owner = identity.grants.find((g) => g.permission === "OWNER");

      const newSession: FrontSession = {
        id,
        account: owner?.accountId,
        role: identity.role,
        profiles,
        at: Date.now(),
      };

      if (req.session.front) {
        const existingFront = req.session.front.find((f) => f.id === id);
        if (existingFront) {
          if (existingFront.role !== identity.role) {
            existingFront.role = identity.role;
            existingFront.at = Date.now();
            sessionUpdated = true;
          }
          if (!isEqual(existingFront.profiles, profiles)) {
            existingFront.profiles = profiles;
            existingFront.at = Date.now();
            sessionUpdated = true;
          }
        } else {
          req.session.front.push(newSession);
          sessionUpdated = true;
        }
      } else {
        req.session.front = [newSession];
        sessionUpdated = true;
      }
    }

    if (sessionUpdated) {
      await req.session.save();
    }

    const rules = rulesFor(identities);
    const ability = abilityFor(rules);
    if (options?.baseRequirement && !options.baseRequirement(ability)) {
      return [false, false, false] as const;
    }
    return [ability, prisma as ReturnedPrismaClient<Options>, rules] as const;
  }

  if (users) {
    const prisma = options?.prisma ?? new PrismaClient();

    const grants = await prisma.identityGrant.findMany({
      where: {
        accountId: { in: users.map((u) => u.id) },
        permission: { in: [Permission.OWNER, Permission.ADMIN] },
      },
      include: {
        identity: {
          include: {
            profiles: true,
          },
        },
      },
    });

    const identities = uniqBy(grants, (i) => i.identityId).map<ActiveIdentity>((grant) => {
      return {
        id: grant.identityId,
        profiles: grant.identity.profiles.map((profile) => ({
          permission: profile.permission,
          profileId: profile.profileId,
        })),
        role: grant.identity.role,
      };
    });

    const rules = rulesFor(identities);
    const ability = abilityFor(rules);
    if (options?.baseRequirement && !options.baseRequirement(ability)) {
      return [false, false, false] as const;
    }

    return [ability, prisma as ReturnedPrismaClient<Options>, rules] as const;
  }

  if (options?.ensureUser) {
    return [false, false, false] as const;
  }

  const rules = rulesFor([]);
  const ability = abilityFor(rules);
  if (options?.baseRequirement && !options.baseRequirement(ability)) {
    return [false, false, false] as const;
  }
  return [
    ability,
    (options?.prisma ?? new PrismaClient()) as ReturnedPrismaClient<Options>,
    rules,
  ] as const;
}
