import { customAlphabet } from "nanoid";
import { nolookalikesSafe } from "nanoid-dictionary";

describe("E2E Application Tests", () => {
  it("can register, create profiles, post", () => {
    const id = customAlphabet(nolookalikesSafe, 6)();
    const systemHandle = id;
    const jayHandle = `jay${id}`;
    const email = `${id}@example.com`;
    cy.visit("http://plural.local:4200/");

    cy.contains("Plural Social");

    cy.contains("Sign In");
    cy.contains("Register");

    cy.contains("Create Account").click();

    cy.url().should("include", "/register/email/");

    // Step: User Registration

    cy.contains("Create An Account");
    cy.contains("Email Address");
    cy.contains("Create Account");

    cy.get("input[name='email']").type(email);
    cy.get("input[name='password']").type("testing");
    cy.get("button[type='submit']").click();

    cy.url().should("include", "/email/confirm/");

    // Step: Confirmation
    // Tests should be running in email bypass mode.

    cy.contains("Confirm Email Account");

    cy.get("button[type='submit']").click();

    cy.url().should("include", "/register/email/login/");

    // Step: First login

    cy.contains("Account Login");
    cy.get("input[name='email']").type(email);
    cy.get("input[name='password']").type("testing");
    cy.get("button[type='submit']").click();

    cy.url().should("include", "/register/identities/");

    // Step: create identities

    cy.contains("Identities");
    cy.get("input[name='name']").type("Test");
    cy.get("input[name='displayName']").type("Test System");
    cy.get("button[type='submit']").click();

    cy.get("[data-identity-name='Test']");

    cy.get("input[name='name']").clear().type("Jay");
    cy.get("input[name='displayName']").clear();
    cy.get("button[type='submit']").click();

    cy.get("[data-identity-name='Jay']");

    cy.contains("Next Step: Profile Creation").click();

    cy.url().should("include", "/register/profiles/");

    // Step: create profiles

    cy.get("select[name='owner']").select("Test System");
    cy.get("input[name='slug']").type(systemHandle);
    cy.get("select[name='displayId']").select("Test System");
    cy.get("button[type='submit']").click();

    cy.get(`[data-profile-slug='${systemHandle}']`);

    cy.reload();

    cy.get("select[name='parent']").select("Test System");
    cy.get("select[name='owner']").select("Jay");
    cy.get("input[name='slug']").clear().type(jayHandle);
    cy.get("input[name='display.name']").type("Jay's Profile");
    cy.get("button[type='submit']").click();

    cy.get(`[data-profile-slug='${jayHandle}']`);

    // Step: view profiles
    cy.visit(`http://plural.local:4200/@${systemHandle}/`, {
      retryOnStatusCodeFailure: true,
    });

    cy.contains(`@${systemHandle}@plural.local:4200`);
    cy.contains("Test System");
    cy.contains("Follow");
    cy.contains("New Toot");

    // Step: edit profile

    cy.get("[data-test-id='profile-dropdown']").click().focus().type("{enter}");
    cy.contains("Edit Profile").click();

    cy.contains("Display ID", {
      timeout: 20 * 1000,
    });

    cy.url().should("contain", "/account/profile/");

    cy.contains("Edit Display");
    cy.contains("Name");
    cy.contains("Visibility");
    cy.get("input[name='displayName']").clear().type("The Test System");
    cy.get("button[type='submit']").click();
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(100);

    cy.visit(`http://plural.local:4200/@${systemHandle}/`);
    cy.contains("The Test System");
  });
});
