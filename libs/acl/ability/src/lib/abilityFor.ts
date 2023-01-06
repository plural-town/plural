import { AbilityBuilder, createMongoAbility } from "@casl/ability";
import { ActiveIdentity } from "@plural-town/acl-models";
import { Role } from "@prisma/client";
import { PluralTownAbility } from "./PluralTownAbility";
import { highestRole, requireRole } from "./util/role-math";

export function abilityFor(identities: ActiveIdentity[]) {
  const { can, build } = new AbilityBuilder<PluralTownAbility>(createMongoAbility);

  const roles = identities.map(i => i.role);
  const role = highestRole(roles);

  if(requireRole(role, Role.MOD)) {
    can("browse", "AdminDashboard");
  }

  return build();
}
