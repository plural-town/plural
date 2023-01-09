describe("Account Dashboard", () => {
  before(() => {
    cy.viewport("macbook-16");
  });

  it("redirects unauthenticated users to login", () => {
    cy.visit("/account/");
    cy.contains("Login");
    cy.url().should("include", "/login/");
  });
});
