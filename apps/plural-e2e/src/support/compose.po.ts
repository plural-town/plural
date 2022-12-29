export const draftSetAsLatest = () => {
  cy.contains("Set as latest draft").click();
  cy.contains("This note has been published as the latest stable draft.");
};

export const addDestinationToDraft = (
  profileName: string,
  privacy = "PUBLIC",
  authorship = "Featured",
) => {
  cy.get("[data-test-id='additional-destination'] select[name='profileId']").select(profileName);
  cy.get("[data-test-id='additional-destination'] select[name='privacy']").select(privacy);
  cy.get("[data-test-id='additional-destination'] select[name='noteAuthor']").select(authorship);
  cy.contains("Add Destination").click();
};

export const publishDraftToProfile = (
  profileId: string,
  draftIdVariable: string,
) => {
  cy.get(`[data-publish-to='${profileId}']`).click();
  cy.contains("Published to");
  cy.get("[data-published-id]").invoke("attr", "data-published-id").as(draftIdVariable);
}
