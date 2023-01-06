import { Role } from "@prisma/client";

type RoleParameter = Role | "PUBLIC";

const ROLE_PRIORITY: Record<RoleParameter, number> = {
  PUBLIC: 0,
  [Role.USER]: 10,
  [Role.MOD]: 50,
  [Role.ADMIN]: 75,
  [Role.OWNER]: 100,
};

export function highestRole(roles: RoleParameter[]) {
  return roles.reduce((a, b) => (ROLE_PRIORITY[a] >= ROLE_PRIORITY[b]) ? a : b, "PUBLIC");
}

export function requireRole(
  heldRole: RoleParameter,
  threshold: Role,
): boolean {
  if(heldRole === "PUBLIC") {
    return false;
  }
  return ROLE_PRIORITY[heldRole] >= ROLE_PRIORITY[threshold];
}
