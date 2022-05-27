import Gameboard from "../gameboard";
import Ship from "../ships";

test("gameboard placeship", () => {
  const gameboard = new Gameboard();
  const shipData1 = { name: "ship1", coordinates: ["x1y1", "x2y1", "x3y1"] };
  const expectedShip = new Ship(shipData1);
  const expectedBoard = {
    x1y1: { ship: expectedShip },
    x2y1: { ship: expectedShip },
    x3y1: { ship: expectedShip },
  };
  const expectedShips = { ship1: expectedShip };

  gameboard.placeShip(shipData1);

  expect(gameboard.shipsDatabase).toEqual(expectedShips);
  expect(gameboard.boardDatabase).toEqual(expectedBoard);
});
