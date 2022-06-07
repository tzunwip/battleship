import Gameboard from "../gameboard";
import Ship from "../ships";

const newPlayerInput = {
  name: "A",
  color: "red",
  isComputer: false,
};

test("check place ship valid", () => {
  const gameboard = new Gameboard(newPlayerInput);
  const shipData1 = { id: "ship1", coordinates: ["x1y1", "x2y1", "x3y1"] };

  expect(gameboard.checkPlaceShipValid(shipData1)).toEqual(true);
});

test("check place ship invalid", () => {
  const gameboard = new Gameboard(newPlayerInput);
  const shipData1 = { id: "ship1", coordinates: ["x1y1", "x2y1", "x3y1"] };

  expect(gameboard.checkPlaceShipValid(shipData1)).toEqual(true);

  gameboard.placeShip(shipData1);

  expect(gameboard.checkPlaceShipValid(shipData1)).toEqual(false);
});

test("gameboard placeship", () => {
  const gameboard = new Gameboard(newPlayerInput);
  const shipData1 = { id: "ship1", coordinates: ["x1y1", "x2y1", "x3y1"] };

  gameboard.placeShip(shipData1);

  const expectedShip = new Ship(shipData1);
  const expectedBoard = {
    x1y1: { ship: expectedShip },
    x2y1: { ship: expectedShip },
    x3y1: { ship: expectedShip },
  };
  const expectedShips = { ship1: expectedShip };

  expect(gameboard.shipsDatabase).toEqual(expectedShips);
  expect(gameboard.boardDatabase).toEqual(expectedBoard);
});

test("gameboard placeship invalid", () => {
  const gameboard = new Gameboard(newPlayerInput);
  const shipData1 = { id: "ship1", coordinates: ["x1y1", "x2y1", "x3y1"] };
  const shipData2 = { id: "ship2", coordinates: ["x1y1", "x1y2", "x1y3"] };

  gameboard.placeShip(shipData1);

  const expectedShip = new Ship(shipData1);
  const expectedBoard = {
    x1y1: { ship: expectedShip },
    x2y1: { ship: expectedShip },
    x3y1: { ship: expectedShip },
  };
  const expectedShips = { ship1: expectedShip };

  expect(gameboard.placeShip(shipData2)).toEqual("invalid placement");
  expect(gameboard.shipsDatabase).toEqual(expectedShips);
  expect(gameboard.boardDatabase).toEqual(expectedBoard);
});

test("gameboard recieve attack hit ship", () => {
  let gameboard = new Gameboard(newPlayerInput);
  let shipData1 = { id: "ship1", coordinates: ["x1y1", "x2y1", "x3y1"] };
  const attackCoordinate = "x1y1";

  gameboard.placeShip(shipData1);

  const expectedShip = new Ship(shipData1);
  expectedShip.hit(attackCoordinate);
  const expectedBoard = {
    x1y1: { isAttacked: true, ship: expectedShip },
    x2y1: { ship: expectedShip },
    x3y1: { ship: expectedShip },
  };
  const expectedShips = { ship1: expectedShip };

  expect(gameboard.receiveAttack("x1y1")).toEqual("hit");
  expect(gameboard.boardDatabase).toEqual(expectedBoard);
  expect(gameboard.shipsDatabase).toEqual(expectedShips);
});

test("gameboard recieve attack hit empty", () => {
  let gameboard = new Gameboard(newPlayerInput);
  let shipData1 = { id: "ship1", coordinates: ["x1y1", "x2y1", "x3y1"] };
  let attackCoordinate = "x1y2";

  gameboard.placeShip(shipData1);

  const expectedShip = new Ship(shipData1);
  const expectedBoard = {
    x1y1: { ship: expectedShip },
    x2y1: { ship: expectedShip },
    x3y1: { ship: expectedShip },
    x1y2: { isAttacked: true },
  };
  const expectedShips = { ship1: expectedShip };

  expect(gameboard.receiveAttack(attackCoordinate)).toEqual("miss");
  expect(gameboard.boardDatabase).toEqual(expectedBoard);
  expect(gameboard.shipsDatabase).toEqual(expectedShips);
});

test("gameboard duplicate recieve attack ship", () => {
  let gameboard = new Gameboard(newPlayerInput);
  let shipData1 = { id: "ship1", coordinates: ["x1y1", "x2y1", "x3y1"] };
  const attackCoordinate = "x1y1";

  gameboard.placeShip(shipData1);

  const expectedShip = new Ship(shipData1);
  expectedShip.hit(attackCoordinate);
  const expectedBoard = {
    x1y1: { isAttacked: true, ship: expectedShip },
    x2y1: { ship: expectedShip },
    x3y1: { ship: expectedShip },
  };
  const expectedShips = { ship1: expectedShip };

  expect(gameboard.receiveAttack("x1y1")).toEqual("hit");
  expect(gameboard.boardDatabase).toEqual(expectedBoard);
  expect(gameboard.shipsDatabase).toEqual(expectedShips);
});

test("gameboard duplicate recieve attack empty", () => {
  let gameboard = new Gameboard(newPlayerInput);
  let shipData1 = { id: "ship1", coordinates: ["x1y1", "x2y1", "x3y1"] };
  let attackCoordinate = "x1y2";

  gameboard.placeShip(shipData1);

  const expectedShip = new Ship(shipData1);
  const expectedBoard = {
    x1y1: { ship: expectedShip },
    x2y1: { ship: expectedShip },
    x3y1: { ship: expectedShip },
    x1y2: { isAttacked: true },
  };
  const expectedShips = { ship1: expectedShip };

  expect(gameboard.receiveAttack(attackCoordinate)).toEqual("miss");
  expect(gameboard.boardDatabase).toEqual(expectedBoard);
  expect(gameboard.shipsDatabase).toEqual(expectedShips);
});

test("ship status new game", () => {
  let gameboard = new Gameboard(newPlayerInput);
  let shipData1 = { id: "ship1", coordinates: ["x1y1", "x2y1", "x3y1"] };

  gameboard.placeShip(shipData1);

  const expectedShipStatus = { ship1: false };

  expect(gameboard.getShipStatus()).toEqual(expectedShipStatus);
});

test("ship status all sunk", () => {
  let gameboard = new Gameboard(newPlayerInput);
  let shipData1 = { id: "ship1", coordinates: ["x1y1", "x2y1", "x3y1"] };

  gameboard.placeShip(shipData1);
  gameboard.receiveAttack("x1y1");
  gameboard.receiveAttack("x2y1");
  gameboard.receiveAttack("x3y1");

  const expectedShipStatus = { ship1: true };

  expect(gameboard.getShipStatus()).toEqual(expectedShipStatus);
});

test("are all ships sunk", () => {
  let gameboard = new Gameboard(newPlayerInput);
  let shipData1 = { id: "ship1", coordinates: ["x1y1"] };

  gameboard.placeShip(shipData1);

  expect(gameboard.areAllShipsSunk()).toEqual(false);

  gameboard.receiveAttack("x1y1");

  expect(gameboard.areAllShipsSunk()).toEqual(true);
});
