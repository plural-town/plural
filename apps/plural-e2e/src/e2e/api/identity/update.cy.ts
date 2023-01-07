describe("/api/identity/[identityId]/update/", () => {
  before(() => {
    cy.clean();
  });

  it("can be used by administrators to update identities", () => {
    cy.apiSession("updateIdentityAdmin", "admin@example.com", "testing");
    cy.request({
      method: "POST",
      url: "/api/identity/other/update/",
      body: {
        role: "MOD",
      },
    }).then((res) => {
      expect(res.status).to.eq(200);
    });
  });

  it("rejects users promoting their own role", () => {
    cy.apiSession("updateIdentity", "test@example.com", "testing");
    cy.request({
      method: "POST",
      url: "/api/identity/system/update/",
      body: {
        role: "MOD",
      },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(401);
      expect(res.body).to.haveOwnProperty("error", "MISSING_PERMISSION_FOR_FIELDS");
      expect(res.body).to.haveOwnProperty("fields");
      expect(res.body.fields).to.deep.eq(["role"]);
    });
  });
});
