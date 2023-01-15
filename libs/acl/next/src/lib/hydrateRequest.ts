import { ServerAuthHydration } from "@plural/use-auth";
import { RequestWithSession } from "./abilityForRequest";

export function hydrateRequest(req: RequestWithSession): ServerAuthHydration {
  const { users, front } = req.session;

  return {
    users:
      users?.map((u) => ({
        id: u.id,
      })) ?? null,
    front:
      front?.map((f) => ({
        id: f.id,
        name: f.name ?? f.id,
        account: f.account ?? null,
      })) ?? null,
  };
}
