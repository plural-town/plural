import { AbilityBuilder, createMongoAbility } from "@casl/ability";
import { ActiveIdentity } from "@plural-town/acl-models";
import { Role } from "@prisma/client";
import { PluralTownAbility, PluralTownRule } from "./PluralTownAbility";
import { highestRole, requireRole } from "./util/role-math";

export function rulesFor(identities: ActiveIdentity[]): PluralTownRule[] {
  const { can, rules } = new AbilityBuilder<PluralTownAbility>(createMongoAbility);

  const roles = identities.map((i) => i.role);
  const role = highestRole(roles);

  if (requireRole(role, Role.MOD)) {
    can("browse", "AdminDashboard");
  }

  if (requireRole(role, Role.ADMIN)) {
    can("browse", "AdminSiteSettings");
  }

  return rules;
}
