import { AddNoteDestination } from "@plural/schema";

const ADD_ALTER_1: AddNoteDestination = {
  profileId: "alter1",
  localOnly: false,
  privacy: "PUBLIC",
  noteAuthor: "FEATURED",
};

describe("/api/note/:noteId/destinations/add/", () => {

  before(() => {
    cy.clean();
  });

  it("can add a profile", () => {
    cy.apiSession("update", "test@example.com", "testing");
    cy.request({
      method: "POST",
      url: "/api/note/note1/destinations/add/",
      body: {
        profileId: "alter2",
        localOnly: false,
        privacy: "PUBLIC",
        noteAuthor: "FEATURED",
      },
    }).then(res => {
      expect(res.status).to.eq(200);
    });
  });

  it("requires login", () => {
    cy.request({
      method: "POST",
      url: "/api/note/note1/destinations/add/",
      body: ADD_ALTER_1,
      failOnStatusCode: false,
    }).then(res => {
      expect(res.status).to.eq(401);
    });
  });

  it("does not allow you to add someone else's profile", () => {
    cy.apiSession("update", "test@example.com", "testing");
    cy.request({
      method: "POST",
      url: "/api/note/note1/destinations/add/",
      body: {
        profileId: "other",
        localOnly: false,
        privacy: "PRIVATE",
        noteAuthor: "FEATURED",
      },
      failOnStatusCode: false,
    }).then(res => {
      expect(res.status).to.eq(404);
      expect(res.body.resourceType).to.eq("profile");
    });
  });

  it("does not allow you to add a shared (VIEW) profile", () => {
    cy.apiSession("update", "test@example.com", "testing");
    cy.request({
      method: "POST",
      url: "/api/note/note1/destinations/add/",
      body: {
        profileId: "shared",
        localOnly: false,
        privacy: "PRIVATE",
        noteAuthor: "FEATURED",
      },
      failOnStatusCode: false,
    }).then(res => {
      expect(res.status).to.eq(404);
      expect(res.body.resourceType).to.eq("profile");
    });
  });

  it("404s if profile does not exist", () => {
    cy.apiSession("update", "test@example.com", "testing");
    cy.request({
      method: "POST",
      url: "/api/note/note1/destinations/add/",
      body: {
        profileId: "unknown",
        localOnly: false,
        privacy: "PRIVATE",
        noteAuthor: "FEATURED",
      },
      failOnStatusCode: false,
    }).then(res => {
      expect(res.status).to.eq(404);
      expect(res.body.resourceType).to.eq("profile");
    });
  });

  it("does not allow you to edit someone else's note", () => {
    cy.apiSession("update-other", "other@example.com", "testing");
    cy.request({
      method: "POST",
      url: "/api/note/note1/destinations/add/",
      body: {
        profileId: "other",
        localOnly: false,
        privacy: "PRIVATE",
        noteAuthor: "FEATURED",
      },
      failOnStatusCode: false,
    }).then(res => {
      expect(res.status).to.eq(404);
      expect(res.body.resourceType).to.eq("note");
    });
  });

  it("404s if note doesn't exist", () => {
    cy.apiSession("update", "test@example.com", "testing");
    cy.request({
      method: "POST",
      url: "/api/note/unknown/destinations/add/",
      body: ADD_ALTER_1,
      failOnStatusCode: false,
    }).then(res => {
      expect(res.status).to.eq(404);
      expect(res.body.resourceType).to.eq("note");
    });
  });

});
