describe("Identity Switching", () => {
  before(() => {
    cy.clean();
  });

  it("can switch identities", () => {
    cy.login("identitySwitch", "test@example.com", "testing");
    cy.visit("/");

    cy.get("[aria-label='Account menu']");
    cy.get("[data-front-avatar]").should("have.length", 0);

    cy.get("[aria-label='Account menu']").click();
    cy.contains("Update Active Identities").click({
      scrollBehavior: false,
      force: true,
    });

    cy.contains("No identities are active.");

    cy.get("input[type='checkbox'][name='replace']").should("not.be.checked");
    cy.get("select[name='identity']").select("Test System");
    cy.contains("Select Identity").click();

    cy.get("[data-front-avatar='system']").should("have.length", 1);
    // TODO: Check that the account menu has been fully replaced and is not visible
    // (this check can't find the element, but 'should.have.length=1' finds an element)
    // cy.get("[aria-label='Account menu']").should("not.be.visible");

    cy.get("select[name='identity']").select("Jay");
    cy.contains("Select Identity").click();

    cy.get("[data-front-avatar]").should("have.length", 2);
    cy.get("[data-front-avatar='alter1']").should("have.length", 1);

    cy.get("select[name='identity']").select("Test System");
    cy.get("input[name='replace']").check({
      force: true,
    });
    cy.contains("Select Identity").click();

    cy.get("[data-front-avatar]").should("have.length", 1);
  });
});
