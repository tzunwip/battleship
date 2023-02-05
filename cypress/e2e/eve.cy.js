import { playerone, playertwo } from "../support/constants";
import { SHIPS_CONFIG } from "../../src/state/state";

describe("eve mode", () => {
  it("completes fully auto game", () => {
    cy.clock();
    cy.visit("/index.html");

    cy.findByRole("button", { name: "2 Players" }).click();

    cy.findByPlaceholderText("Player One").type(playerone.name);
    cy.findByPlaceholderText("Player Two").type(playertwo.name);
    cy.findAllByText("Auto").each((auto) => cy.wrap(auto).click());
    cy.findByRole("button", { name: "Continue" }).click();

    cy.findByText("Click to continue").click();
    cy.findByRole("button", { name: "Continue" }).click();

    cy.findByText("Click to continue").click();
    cy.findByRole("button", { name: "Continue" }).click();

    cy.findByRole("button", { name: "Random" }).click();

    cy.get(".inactive").should("not.exist");
    cy.get(".reveal").should(
      "have.length",
      2 * SHIPS_CONFIG.reduce((acc, ship) => acc + ship.shipLength, 0)
    );

    cy.tick(200000);

    cy.get(".win-popup", { timeout: 200000 }).should("be.visible");
  });
});
