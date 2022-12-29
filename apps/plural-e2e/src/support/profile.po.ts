export const visitRootProfile = (handle: string, content: string) => {
  cy.visit(`/${handle}/`);
  cy.contains(content);
};

export const startDraftFromProfile = (text: string, author: string) => {
  cy.get("textarea[name='content']").type(text);
  cy.get("select[name='author']").select(author);
  cy.contains("Start Draft").click();

  cy.url().should("contain", "/compose/");
  cy.contains("Compose");
};
