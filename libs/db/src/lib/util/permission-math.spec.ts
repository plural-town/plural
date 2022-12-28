import { permissionAbove, requirePermission } from "./permission-math";

describe("permission math", () => {

  describe("permissionAbove", () => {

    test("OWNER is above VIEW", () => {
      expect(permissionAbove("OWNER", "VIEW")).toBe(true);
    });

    test("ADMIN is above EDIT", () => {
      expect(permissionAbove("ADMIN", "EDIT")).toBe(true);
    });

    test("EDIT is not above ADMIN", () => {
      expect(permissionAbove("EDIT", "ADMIN")).toBe(false);
    });

    test("POST is not above POST", () => {
      expect(permissionAbove("POST", "POST")).toBe(false);
    });

  });

  describe("requirePermission", () => {

    test("OWNER meets ADMIN threshold", () => {
      expect(requirePermission("OWNER", "ADMIN")).toBe(true);
    });

    test("ADMIN meets ADMIN threshold", () => {
      expect(requirePermission("ADMIN", "ADMIN")).toBe(true);
    });

    test("EDIT does not meet ADMIN threshold", () => {
      expect(requirePermission("EDIT", "ADMIN")).toBe(false);
    });

  })

});
