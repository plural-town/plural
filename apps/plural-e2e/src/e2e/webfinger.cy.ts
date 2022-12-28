describe("webfinger", () => {

  it.skip("handles profiles", () => {
    cy.request("/.well-known/webfinger?resource=acct:me@plural.local:4200").as("finger");
    cy.get("@finger").should((res) => {
      expect(res.body).to.have.property("aliases");
    });
  });

  it("handles sub-profiles", () => {
    cy.request("/.well-known/webfinger?resource=acct:system.alter@plural.local:4200").as("finger");
    cy.get("@finger").should(res => {
      expect(res.body).to.have.property("aliases");
    });
  });

});
