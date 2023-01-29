import { GRID_SIZE, SHIPS_CONFIG } from "../../src/state/state";

const playerone = {
  name: "player 1",
};

describe("game e2e", () => {
  beforeEach(() => cy.visit("index.html"));

  it("start screen", () => {
    cy.get("body")
      .should("have.css", "background-image")
      .and("include", "ocean-background.png")
      .then((url) =>
        cy.request(url.split('"')[1]).its("status").should("equal", 200)
      );
    cy.findByTitle("Battleship").should("be.visible");
    cy.findByText("Start Game").should("be.visible");
    cy.findByRole("button", { name: "1 Player" }).should("be.visible");
    cy.findByRole("button", { name: "2 Players" }).should("be.visible");
    cy.get('a[href*="github"] > i.github').and("be.visible");
  });

  it.only("1 player game", () => {
    cy.get("button").contains("1 Player").click();

    // test 1 player name input screen
    cy.findByText("Enter your name:").should("be.visible");
    cy.findByPlaceholderText("Player")
      .as("playerOneInput")
      .should("be.visible");
    cy.findByText("Auto").as("autoLabel").should("be.visible");
    cy.findByLabelText("Auto", { selector: "input" })
      .as("autoCheckbox")
      .should("be.visible");
    cy.findByRole("button", { name: "Continue" })
      .as("continueButton")
      .should("be.visible");

    // empty name input throws validation error
    cy.get("@continueButton").click();
    cy.get("input:invalid").should("have.length", 1);

    // test auto checkbox
    cy.get("@autoLabel").click();
    cy.get("@autoCheckbox").should("be.checked");
    cy.get("@autoLabel").click();
    cy.get("@autoCheckbox").should("be.not.checked");

    cy.get("@playerOneInput").type(playerone.name);
    cy.get("@continueButton").click();

    // place ship screen
    cy.findByText(`${playerone.name}'s Ships`).should("be.visible");
    cy.findByText("Drag and drop, double click to rotate").should("be.visible");
    cy.get(".place-ships__board").as("board");
    cy.get("@board")
      .find(".place-ships__grid")
      .should("have.length", Math.pow(GRID_SIZE, 2));

    // test ship placement
    const testShips = () => {
      cy.get(".occupied").should(
        "have.length",
        SHIPS_CONFIG.reduce((acc, ship) => acc + ship.shipLength, 0)
      );

      SHIPS_CONFIG.forEach((ship) => {
        cy.get(`#${ship.id}`).as(ship.id);
        cy.get(`@${ship.id}`)
          .children()
          .should("have.length", ship.shipLength)
          .and("be.visible");
        cy.get(`.${ship.id}.occupied`).should("have.length", ship.shipLength);

        // ship orientation & anchor coordinates
        const shipData = {};
        cy.get(`@${ship.id}`)
          .invoke("data", "orientation")
          .then((orientation) => {
            shipData.orientation = orientation.toString();
            cy.get(`@${ship.id}`).should(
              "have.class",
              orientation === "x" ? "grid-row" : "grid-column"
            );
          });
        cy.get(`@${ship.id}`)
          .parent()
          .invoke("data", "x")
          .then((x) => (shipData.x = x));
        cy.get(`@${ship.id}`)
          .parent()
          .invoke("data", "y")
          .then((y) => (shipData.y = y));

        cy.get("@board").then(() => {
          for (let i = 0; i < ship.shipLength; i++) {
            const coordinate =
              shipData.orientation === "x"
                ? `x${shipData.x + i}y${shipData.y}`
                : `x${shipData.x}y${shipData.y + i}`;
            cy.get(`[id=${coordinate}]`)
              .should("have.class", ship.id)
              .and("have.class", "occupied");
          }
        });

        // test rotate
        cy.get(`@${ship.id}`).dblclick("topLeft");
      });
    };

    // rotate, randomize & test ships placement
    cy.get("@board").then(() => testShips());
    cy.findByRole("button", { name: "Randomize" }).should("be.visible").click();
    cy.get("@board").then(() => testShips());

    // wrap occupied grids for later use
    const occupiedGrids = [];
    cy.get(".occupied").each((grid) => occupiedGrids.push(grid.attr("id")));
    cy.wrap(occupiedGrids).as("occupiedGrids");

    cy.findByRole("button", { name: "Continue" }).should("be.visible").click();
  });
});
