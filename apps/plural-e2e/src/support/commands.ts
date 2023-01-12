// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace Cypress {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface Chainable<Subject> {
    /**
     * @param name The name of the snapshots that will be generated
     * @param testThreshold @default 0 A number between 0 and 1 that represents the allowed percentage of pixels that can be different between the two snapshots
     * @param retryOptions @default { limit: 1 } @see {@link RecurseDefaults}
     * @example cy.compareSnapshot('empty-canvas', 0.1)
     */
    compareSnapshot(
      name: string,
      testThreshold?: number,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      retryOptions?: Partial<any>
    ): Chainable<Element>;

    /**
     * Reset the entire database, and seed testing data
     */
    clean(): void;
    apiSession(id: string, email: string, password: string): void;
    login(id: string, email: string, password: string): void;
    visitNoScript(route: string): void;
  }
}

Cypress.Commands.add("clean", () => {
  cy.exec("yarn nx run models:reset");
});

Cypress.Commands.add("apiSession", (id, email, password) => {
  cy.session(
    id,
    () => {
      cy.request({
        method: "POST",
        url: "/api/login/",
        body: {
          email,
          password,
        },
      });
    },
    {
      validate() {
        cy.getCookie("plural_social").should("exist");
      },
    },
  );
});

//
// -- This is a parent command --
Cypress.Commands.add("login", (id, email, password) => {
  cy.session(id, () => {
    cy.visit("/login/");
    cy.get("input[name='email']").type(email);
    cy.get("input[name='password']").type(password);
    cy.get("button[type='submit']").click();
    cy.contains("Plural Social", {
      timeout: 20 * 1000,
    });
  });
});
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

Cypress.Commands.add("visitNoScript", (route: string) => {
  cy.request(route)
    .its("body")
    .then((html) => {
      const noScript = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
      cy.document().invoke({ log: false }, "write", noScript);
    });
});
