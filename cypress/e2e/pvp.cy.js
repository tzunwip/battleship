import { playerone, playertwo } from "../support/constants";

describe("pvp mode", () => {
  it.only("both manual; renders and game completes", () => {
    cy.visit("index.html");

    cy.findByRole("button", { name: "2 Players" }).should("be.visible").click();

    cy.findByText("Enter your names:").should("be.visible");

    // test validation empty inputs
    cy.findByRole("button", { name: "Continue" })
      .as("continueButton")
      .should("be.visible")
      .click();
    cy.get("input:invalid").should("have.length", 2);

    cy.findByPlaceholderText("Player One")
      .should("be.visible")
      .type(playerone.name);
    cy.findByPlaceholderText("Player Two")
      .should("be.visible")
      .type(playertwo.name);

    cy.get("@continueButton").click();

    cy.findPassDeviceSplash(playerone.name);

    cy.capturePlayerState(playerone.name);
    cy.get("@continueButton").click();

    cy.findPassDeviceSplash(playertwo.name);

    cy.capturePlayerState(playertwo.name);
    cy.get("@continueButton").click();

    cy.findByRole("button", { name: playerone.name }).click();

    // ships should not be revealed
    cy.get(".reveal").should("not.exist");

    cy.get("#player0").as("playerOneBoard").should("be.visible");
    cy.get("#player1").as("playerTwoBoard").should("be.visible");

    cy.get("@playerOneBoard").within(() => {
      cy.get(`@${playerone.name}`).then((occupied) => {
        const searchString = occupied.grids
          .map((gridId) => `.${gridId}:not(.hit, .miss, .sunk)`)
          .join(", ");
        cy.get(searchString).as("playerOneTargets");
      });
    });

    function playPveRound() {
      cy.get("#player0:not(.inactive), #player1:not(.inactive)").then(
        (board) => {
          if (board.text().includes(`${playerone.name}'s Ships`)) {
            cy.get("@playerOneBoard").within(() =>
              cy.get("@playerOneTargets").first().click()
            );
          } else {
            cy.get("@playerTwoBoard").within(() =>
              cy
                .get(".game-display__grid:not(.hit, .miss, .sunk)")
                .first()
                .click()
            );
          }

          cy.get("body").then((body) => {
            if (body.find(".win-popup").length > 0) return;
            playPveRound();
          });
        }
      );
    }

    playPveRound();

    // check final board display correct

    // win popup message
    cy.get(".win-popup")
      .should("contain.text", `${playertwo.name} has won!`)
      .and("contain.text", "Click to play again")
      .click();

    cy.testStartScreen();
  });
});
