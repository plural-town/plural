describe("posting e2e", () => {

  before(() => {
    cy.exec("yarn nx run models:reset");
  });

  it("can make a simple post", () => {
    cy.viewport("macbook-15");
    cy.visit("/login/");
    cy.get("input[name='email']").type("test@example.com");
    cy.get("input[name='password']").type("testing");
    cy.get("button[type='submit']").click();

    cy.contains("Plural Social");

    cy.visit("/@test/");
    cy.contains("Test System");

    cy.get("textarea[name='content']").type("#introduction Hello World!");
    cy.get("select[name='author']").select("Test System");
    cy.contains("Start Draft").click();

    cy.url().should("contain", "/compose/");
    cy.contains("Compose");

    cy.contains("Set as latest draft").click();
    cy.contains("This note has been published as the latest stable draft.");

    cy.get("[data-publish-to='systemProfile']").click();
    cy.contains("Published to");

    cy.get("[data-published-id]").invoke("attr", "data-published-id").as("simplePostId");

    cy.visit("/@test/");

    cy.get("@simplePostId").then(id => {
      cy.get(`[data-note][data-note-id='${id}']`).should("have.length", 1);
      cy.get(`[data-note-id='${id}'] [data-note-ft-author='systemProfile']`).should("have.length", 1);
      cy.contains("#introduction Hello World!");
    });
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
    cy.get("[data-test-id='additional-destination'] select[name='privacy']").select("PUBLIC");
    cy.get("[data-test-id='additional-destination'] select[name='noteAuthor']").select("Featured");
    cy.contains("Add Destination").click();

    cy.get("textarea[name='content']").clear().type("Jay and Sam are fronting!");
    cy.contains("Update Draft").click();

    // TODO: show indication of adding destination + updating draft
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(100);

    cy.reload();

    // TODO: Find some better way to wait for reload then wait
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(50);

    cy.get("textarea[name='content']").should("have.value", "Jay and Sam are fronting!");

    cy.get("[data-test-id='additional-destination'] select[name='profileId']").select("Sam Doe");
    cy.get("[data-test-id='additional-destination'] select[name='privacy']").select("PUBLIC");
    cy.get("[data-test-id='additional-destination'] select[name='noteAuthor']").select("Featured");
    cy.contains("Add Destination").click();
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(100);
    cy.reload();
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(50);

    cy.get("[data-destination-form-for-profile='systemProfile'] select[name='noteAuthor']").select("Named");
    cy.get("[data-destination-form-for-profile='systemProfile'] button[type='submit'][data-update-destination]").click();
    cy.contains("Updated destination.");

    cy.contains("Set as latest draft").click();
    cy.contains("This note has been published as the latest stable draft.");

    cy.get("[data-publish-to='systemProfile']").click();
    cy.contains("Published to");
    cy.get("[data-published-id]").invoke("attr", "data-published-id").as("coFrontPostId");

    cy.visit("/@test/");

    cy.contains("Sign In");
    cy.get("@coFrontPostId").then(id => {
      cy.get(`[data-note][data-note-id='${id}']`).should("have.length", 1);
      cy.get(`[data-note-id='${id}'] [data-note-ft-author='alter1']`).should("have.length", 1);
      cy.get(`[data-note-id='${id}'] [data-note-ft-author='alter2']`).should("have.length", 1);
      cy.contains("Jay and Sam are fronting!");
      cy.get(`[data-note-id='${id}'] [data-note-ft-author]`).should("have.length", 2);
    });
  });

});
