import type { Permission, Role } from "@prisma/client";

export interface ActiveProfileGrant {
  profileId: string;
  permission: Permission;
}

export interface ActiveIdentity {
  id: string;
  role: Role;
  profiles: ActiveProfileGrant[];
}
