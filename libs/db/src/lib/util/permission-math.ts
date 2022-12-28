import { Permission } from "@prisma/client";

const PERMISSION_LEVEL = {
  [Permission.OWNER]: 100,
  [Permission.ADMIN]: 80,
  [Permission.EDIT]: 60,
  [Permission.POST]: 40,
  [Permission.VIEW]: 20,
} as const;

export function permissionAbove(
  testPermission: Permission,
  compareTo: Permission | "PUBLIC",
): boolean {
  if(compareTo === "PUBLIC") {
    return true;
  }
  return PERMISSION_LEVEL[testPermission] > PERMISSION_LEVEL[compareTo];
}

/**
 * Test the role a user has, to see if they meet the requirements.
 *
 * @param heldPermission The permission role that a user has.
 * @param threshold The minimum role that the user must meet.
 * @returns `true` if {@link heldPermission} is at least {@link threshold}`
 */
export function requirePermission(
  heldPermission: Permission | "PUBLIC",
  threshold: Permission,
): boolean {
  if(heldPermission === "PUBLIC") {
    return false;
  }
  return PERMISSION_LEVEL[heldPermission] >= PERMISSION_LEVEL[threshold];
}
