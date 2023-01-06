import { AbilityBuilder, createMongoAbility } from "@casl/ability";
import { ActiveIdentity } from "@plural-town/acl-models";
import { Role } from "@prisma/client";
import { PluralTownAbility, PluralTownRule } from "./PluralTownAbility";
import { highestRole, requireRole } from "./util/role-math";

export function rulesFor(identities: ActiveIdentity[]): PluralTownRule[] {
  const { can, cannot, rules } = new AbilityBuilder<PluralTownAbility>(createMongoAbility);

  const roles = identities.map((i) => i.role);
  const role = highestRole(roles);

  if (requireRole(role, Role.MOD)) {
    can("browse", "AdminDashboard");
    cannot("browse", "AdminDashboard", ["*"]);
    can("browse", "AdminDashboard", ["regSettings", "invitations", "accounts"]);
    can("update", "AdminDashboard", ["invitations", "accounts"]);
  }

  if (requireRole(role, Role.ADMIN)) {
    can("browse", "AdminDashboard", ["*"]);
    can("update", "AdminDashboard", ["*"]);
  }

  return rules;
}
