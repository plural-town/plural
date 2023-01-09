import type { Permission, Role } from "@prisma/client";

export interface ActiveAccountGrant {
  accountId: string;
  permission: Permission;
}

export interface ActiveProfileGrant {
  profileId: string;
  permission: Permission;
}

export interface ActiveIdentity {
  id: string;
  role: Role;
  accounts?: ActiveAccountGrant[];
  profiles: ActiveProfileGrant[];
}
