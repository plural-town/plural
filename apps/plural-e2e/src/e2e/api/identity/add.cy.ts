describe("/api/identity/add/", () => {
  before(() => {
    cy.clean();
  });

  it("can active a user's identity", () => {
    cy.apiSession("addIdentity", "test@example.com", "testing");
    cy.request({
      method: "POST",
      url: "/api/session/identity/add/",
      body: {
        identity: "system",
        replace: false,
      },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(200);
    });
  });

  it("does not allow users to activate other identities", () => {
    cy.apiSession("addOtherIdentity", "test@example.com", "testing");
    cy.request({
      method: "POST",
      url: "/api/session/identity/add/",
      body: {
        identity: "other",
        replace: false,
      },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(404);
    });
  });
});
