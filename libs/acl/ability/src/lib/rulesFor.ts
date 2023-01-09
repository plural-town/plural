import { AbilityBuilder, createMongoAbility } from "@casl/ability";
import { ActiveIdentity } from "@plural-town/acl-models";
import { Role, Visibility } from "@prisma/client";
import { PluralTownAbility, PluralTownRule } from "./PluralTownAbility";
import { highestRole, requireRole } from "./util/role-math";

const PUBLIC: Visibility[] = [Visibility.PUBLIC, Visibility.UNLISTED];

export function rulesFor(identities: ActiveIdentity[]): PluralTownRule[] {
  const { can, cannot, rules } = new AbilityBuilder<PluralTownAbility>(createMongoAbility);

  const roles = identities.map((i) => i.role);
  const role = highestRole(roles);

  can("update", "Identity", ["visibility", "name", "nameVisibility"], {
    id: { $in: identities.map((i) => i.id) },
  });

  can("browse", "Identity", ["kind", "id"], {
    visibility: { $in: PUBLIC },
  });

  can("browse", "Identity", ["name"], {
    visibility: { $in: PUBLIC },
    nameVisibility: { $in: PUBLIC },
  });

  can("browse", "Identity", ["**"], {
    id: { $in: identities.map((i) => i.id) },
  });

  can("activate", "Identity", {
    id: { $in: identities.map((i) => i.id) },
  });

  if (requireRole(role, Role.MOD)) {
    can("browse", "AdminDashboard");
    cannot("browse", "AdminDashboard", ["*"]);
    can("browse", "AdminDashboard", ["regSettings", "invitations", "accounts", "identities"]);
    can("update", "AdminDashboard", ["invitations", "accounts", "identities"]);
    can("browse", "Identity", ["**"]);
  }

  if (requireRole(role, Role.ADMIN)) {
    can("browse", "AdminDashboard", ["*"]);
    can("update", "AdminDashboard", ["*"]);
    can("update", "Identity", ["visibility", "name", "nameVisibility"]);
  }

  if (role === Role.ADMIN) {
    can("update", "Identity", ["role"], {
      role: { $nin: ["ADMIN", "OWNER"] },
    });
  }

  if (role === Role.OWNER) {
    can("update", "Identity", "role");
  }

  return rules;
}
