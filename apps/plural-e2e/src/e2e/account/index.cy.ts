describe("Account Settings Landing", () => {

  before(() => {
    cy.viewport("macbook-16");
    cy.clean();
  });

  it("redirects unauthenticated visitors to login", () => {
    cy.visit("/account/");
    cy.contains("Login");
    cy.url().should("include", "/login/");
  });

  it("renders for users", () => {
    cy.login("settingsLanding", "test@example.com", "testing");
    cy.visit("/account/");
    cy.contains("Account Settings");
  });

  it("can navigate to a list of accounts", () => {
    cy.login("settingsLanding", "test@example.com", "testing");
    cy.visit("/account/");
    cy.contains("Accounts").click();
    cy.contains("You are currently logged in");
  });

});
