import { UpdateDisplay } from "@plural/schema";

const DISPLAY_UPDATE: UpdateDisplay = {
  name: "test",
  nameVisibility: "PUBLIC",
  displayName: "test",
  displayNameVisibility: "PUBLIC",
  bio: "",
  bioVisibility: "PRIVATE",
};

describe("/api/display/:displayId/update/", () => {
  before(() => {
    cy.clean();
  });

  it("requires login", () => {
    cy.request({
      method: "POST",
      url: "/api/display/system-display/update/",
      body: DISPLAY_UPDATE,
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(500);
    });
  });

  it("protects from other accounts", () => {
    cy.apiSession("update-other", "other@example.com", "testing");
    cy.request({
      method: "POST",
      url: "/api/display/system-display/update/",
      body: DISPLAY_UPDATE,
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(404);
    });
  });

  it("404s if document not found", () => {
    cy.apiSession("update", "test@example.com", "testing");
    cy.request({
      method: "POST",
      url: "/api/display/unknown/update/",
      body: DISPLAY_UPDATE,
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(404);
    });
  });
});
