import { nanoid } from "nanoid";

describe("user registration", () => {
  it("can register", () => {
    const id = nanoid();
    cy.visit("/register/");
    cy.get('input[name="name"]').type("Jay Doe");
    cy.get('input[name="email"]').type(`${id}@example.com`);
    cy.get('input[name="password"]').type("testing");
    cy.get('button[type="submit"]').click();

    cy.url().should("eq", "http://localhost:4200/app/front");
  });

  it("can register without javascript", () => {
    const id = nanoid(8);
    cy.visitNoScript("/register");
    cy.get('input[name="name"]').type("Jay Doe");
    cy.get('input[name="email"]').type(`${id}@example.com`);
    cy.get('input[name="password"]').type("testing");
    cy.get('button[type="submit"]').click();

    cy.url().should("eq", "http://localhost:4200/app/front");
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(500);
  });

  it.skip("can register as a singlet without javascript", () => {
    const id = nanoid(8);
    cy.visitNoScript("/register");
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(200);
    cy.get('input[name="name"]').type("Jay Doe");
    cy.get('input[name="email"]').type(`${id}@example.com`);
    cy.get('input[name="password"]').type("testing");
    cy.get('input[name="singlet"][type="checkbox"]').click({
      force: true,
    });
    cy.get('button[type="submit"]').click();

    cy.url().should("eq", "http://localhost:4200/app");
  });
});
