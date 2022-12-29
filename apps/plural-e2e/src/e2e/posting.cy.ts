describe("posting e2e", () => {

  before(() => {
    cy.exec("yarn nx run models:reset");
  });

  it("can make a post on a system account as two alters", () => {
    cy.viewport("macbook-15");
    cy.visit("/login/");
    cy.get("input[name='email']").type("test@example.com");
    cy.get("input[name='password']").type("testing");
    cy.get("button[type='submit']").click();

    cy.contains("Plural Social");

    cy.visit("/@test/");
    cy.contains("Test System");

    cy.get("textarea[name='content']").type("We say hello!");
    cy.get("select[name='author']").select("Jay");
    cy.contains("Start Draft").click();

    cy.url().should("contain", "/compose/");
    cy.contains("Compose");

    cy.get("textarea[name='content']").should("have.value", "We say hello!");
    cy.contains("@test@plural.local:4200");

    cy.get("[data-test-id='additional-destination'] select[name='profileId']").select("Jay");
    cy.get("[data-test-id='additional-destination'] select[name='privacy']").select("UNLISTED");
    cy.get("[data-test-id='additional-destination'] select[name='noteAuthor']").select("Featured");
    cy.contains("Add Destination").click();

    cy.get("textarea[name='content']").clear().type("Hello world!");
    cy.contains("Update Draft").click();

    // TODO: show indication of adding destination + updating draft
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(100);

    cy.reload();

    // TODO: Find some better way to wait for reload then wait
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(50);

    cy.get("textarea[name='content']").should("have.value", "Hello world!");

    cy.get("[data-test-id='additional-destination'] select[name='profileId']").select("Sam Doe");
    cy.get("[data-test-id='additional-destination'] select[name='privacy']").select("UNLISTED");
    cy.get("[data-test-id='additional-destination'] select[name='noteAuthor']").select("Featured");
    cy.contains("Add Destination").click();
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(100);
    cy.reload();
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(50);

    // TODO: change system account to not be featured
    // TODO: post toot
    // TODO: check toot display
  });

});