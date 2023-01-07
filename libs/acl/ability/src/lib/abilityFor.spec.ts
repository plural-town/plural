import { ActiveIdentity } from "@plural-town/acl-models";
import { IdentityDoc } from "@plural/schema";
import { Role } from "@prisma/client";
import { abilityFor } from "./abilityFor";
import { rulesFor } from "./rulesFor";

const USER = {
  id: "user",
  role: Role.USER,
  profiles: [],
} satisfies ActiveIdentity;

const ADMIN = {
  id: "admin",
  role: Role.ADMIN,
  profiles: [],
} satisfies ActiveIdentity;

const PUBLIC_IDENTITY = {
  kind: "Identity",
  id: "1234",
  visibility: "PUBLIC",
  name: "Hello World",
  nameVisibility: "PUBLIC",
} satisfies IdentityDoc;

const PRIVATE_IDENTITY = {
  kind: "Identity",
  id: "1234",
  visibility: "PRIVATE",
  name: "Test",
  nameVisibility: "PUBLIC",
} satisfies IdentityDoc;

describe("abilityFor", () => {
  describe("browse AdminDashboard", () => {
    it("does not allow non-logged in users", () => {
      const ability = abilityFor(rulesFor([]));
      expect(ability.can("browse", "AdminDashboard")).toBe(false);
    });

    it("does not allow average users", () => {
      const ability = abilityFor(rulesFor([USER]));
      expect(ability.can("browse", "AdminDashboard")).toBe(false);
    });

    it("allows admins", () => {
      const ability = abilityFor(rulesFor([ADMIN]));
      expect(ability.can("browse", "AdminDashboard")).toBe(true);
    });
  });

  describe("Identity", () => {

    it("knows that anyone may be able to read one or more identities", () => {
      const ability = abilityFor(rulesFor([]));
      expect(ability.can("browse", "Identity")).toBe(true);
    });

    it("allows anyone to browse public identities", () => {
      const ability = abilityFor(rulesFor([]));
      expect(ability.can("browse", PUBLIC_IDENTITY)).toBe(true);
    });

    it("does not allow the public to browse private identities", () => {
      const ability = abilityFor(rulesFor([]));
      expect(ability.can("browse", PRIVATE_IDENTITY)).toBe(false);
    });

    it("allows anyone to read the 'id' field for a public identity", () => {
      const ability = abilityFor(rulesFor([]));
      expect(ability.can("browse", PUBLIC_IDENTITY, "id")).toBe(true);
    });

  });
});
