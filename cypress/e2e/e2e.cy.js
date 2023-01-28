describe("visit http://localhost:8080", () => {
  it("displays start screen", () => {
    cy.visit("http://localhost:8080");

    cy.get("body")
      .should("have.css", "background-image")
      .and("include", "ocean-background.png")
      .then((url) =>
        cy.request(url.split('"')[1]).its("status").should("equal", 200)
      );
    cy.contains("Battleship").should("be.visible");
    cy.contains("Start Game").should("be.visible");
    cy.get("button").contains("1 Player").should("be.visible");
    cy.get("button").contains("2 Players").should("be.visible");
    cy.get('a[href*="github"] > i.github').and("be.visible");
  });
});
