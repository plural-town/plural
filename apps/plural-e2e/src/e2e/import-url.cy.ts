describe("importing a URL via searchbar", () => {

  before(() => {
    cy.viewport("macbook-15");
    cy.exec("yarn nx run models:reset");
  });

  it("can import a remote profile", () => {
    cy.login("import-url", "test@example.com", "testing");
    cy.visit("/@test/");
    cy.get("input[name='q']").type("https://transforthe.win/@test{enter}");
    cy.contains("@test@transforthe.win");
    cy.url().should("include", "/@test@transforthe.win");
  });

});
