describe("Initial Admin Promotion", () => {
  before(() => {
    cy.viewport("macbook-16");
    cy.exec("yarn nx run models:reset");
  });

  it("can promote a user", () => {
    cy.login("admin-initial-promotion", "test@example.com", "testing");
    cy.visit("/admin/initial/");
    cy.contains("Promote Initial Administrator");
    cy.get("select[name='identity']").select("Test System");
    cy.get("input[name='token']").type("promotion_secret");
    cy.get("button[type='submit']").click();
    cy.contains("Server Administration");
  });
});

describe("Administration", () => {
  before(() => {
    cy.viewport("macbook-16");
    cy.exec("yarn nx run models:reset");
  });

  describe("Admin Landing", () => {
    it("redirects public to login", () => {
      cy.visit("/admin/");
      cy.contains("Login");
      cy.url().should("include", "/login/");
    });

    it("redirects non-admin users to login", () => {
      cy.login("admin-landing-test", "test@example.com", "testing");
      cy.visit("/admin/");
      cy.contains("Login");
      cy.url().should("include", "/login/");
    });

    it("displays overview stats to administrators", () => {
      cy.login("admin-landing", "admin@example.com", "testing");
      cy.visit("/admin/");
      cy.contains("Server Administration");
    });
  });
});
