import { SHIPS_CONFIG } from "../../src/state/state";

// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

import "@testing-library/cypress/add-commands";

Cypress.Commands.add("testStartScreen", () => {
  cy.get("body")
    .within(() => {
      cy.findByText("Battleship").should("be.visible");
      cy.findByText("Start Game").should("be.visible");
      cy.findByRole("button", { name: "1 Player" }).should("be.visible");
      cy.findByRole("button", { name: "2 Players" }).should("be.visible");
      cy.get('a[href*="github"] > i.github').and("be.visible");
    })
    .should("have.css", "background-image")
    .and("include", "ocean-background.png")
    .then((url) =>
      cy.request(url.split('"')[1]).its("status").should("equal", 200)
    );
});

Cypress.Commands.add("capturePlayerState", (aliasName) => {
  const occupiedGrids = [];
  const placedShips = {};
  cy.get(".occupied").each((grid) => {
    const coordinate = grid.attr("id");
    const classes = grid.attr("class");
    const type = SHIPS_CONFIG.find((ship) => classes.includes(ship.id)).id;
    occupiedGrids.push(coordinate);
    placedShips[type] = [...(placedShips[type] ?? []), coordinate];
  });
  cy.wrap({ grids: occupiedGrids, ships: placedShips }).as(aliasName);
});

Cypress.Commands.add("findPassDeviceSplash", (playerName) => {
  cy.findByText(`Pass device to ${playerName}`).should("be.visible");
  cy.findByText("Click to continue").should("be.visible").click();
});
