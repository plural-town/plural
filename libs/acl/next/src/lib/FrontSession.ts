import { ActiveAccountGrant, ActiveProfileGrant } from "@plural-town/acl-models";
import type { Role } from "@prisma/client";

export interface FrontSession {
  /**
   * {@link Identity.id}
   */
  id: string;

  /**
   * {@link IdentityGrant.accountId}
   */
  account?: string;

  role?: Role;

  accounts?: ActiveAccountGrant[];

  profiles?: ActiveProfileGrant[];

  /**
   * When this session was stored - used to refresh `role`.
   */
  at: number;
}
