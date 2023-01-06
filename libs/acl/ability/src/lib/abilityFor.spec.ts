import { ActiveIdentity } from "@plural-town/acl-models";
import { Role } from "@prisma/client";
import { abilityFor } from "./abilityFor";
import { rulesFor } from "./rulesFor";

const ADMIN = {
  role: Role.ADMIN,
  profiles: [],
} satisfies ActiveIdentity;

describe("abilityFor", () => {
  describe("browse AdminDashboard", () => {
    it("does not allow non-logged in users", () => {
      const ability = abilityFor(rulesFor([]));
      expect(ability.can("browse", "AdminDashboard")).toBe(false);
    });

    it("allows admins", () => {
      const ability = abilityFor(rulesFor([ADMIN]));
      expect(ability.can("browse", "AdminDashboard")).toBe(true);
    });
  });
});
