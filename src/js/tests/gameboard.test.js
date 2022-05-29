import Gameboard from "../gameboard";
import Ship from "../ships";

test("check place ship valid", () => {
  const gameboard = new Gameboard();
  const shipData1 = { name: "ship1", coordinates: ["x1y1", "x2y1", "x3y1"] };

  expect(gameboard.checkPlaceShipValid(shipData1)).toEqual(true);
});

test("check place ship invalid", () => {
  const gameboard = new Gameboard();
  const shipData1 = { name: "ship1", coordinates: ["x1y1", "x2y1", "x3y1"] };

  expect(gameboard.checkPlaceShipValid(shipData1)).toEqual(true);

  gameboard.placeShip(shipData1);

  expect(gameboard.checkPlaceShipValid(shipData1)).toEqual(false);
});

test("gameboard placeship", () => {
  const gameboard = new Gameboard();
  const shipData1 = { name: "ship1", coordinates: ["x1y1", "x2y1", "x3y1"] };

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
  const gameboard = new Gameboard();
  const shipData1 = { name: "ship1", coordinates: ["x1y1", "x2y1", "x3y1"] };
  const shipData2 = { name: "ship2", coordinates: ["x1y1", "x1y2", "x1y3"] };

  gameboard.placeShip(shipData1);

  const expectedShip = new Ship(shipData1);
  const expectedBoard = {
    x1y1: { ship: expectedShip },
    x2y1: { ship: expectedShip },
    x3y1: { ship: expectedShip },
  };
  const expectedShips = { ship1: expectedShip };

  expect(gameboard.placeShip(shipData2)).toEqual("invalid");
  expect(gameboard.shipsDatabase).toEqual(expectedShips);
  expect(gameboard.boardDatabase).toEqual(expectedBoard);
});

test("gameboard recieve attack hit ship", () => {
  let gameboard = new Gameboard();
  let shipData1 = { name: "ship1", coordinates: ["x1y1", "x2y1", "x3y1"] };
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
  let gameboard = new Gameboard();
  let shipData1 = { name: "ship1", coordinates: ["x1y1", "x2y1", "x3y1"] };
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
  let gameboard = new Gameboard();
  let shipData1 = { name: "ship1", coordinates: ["x1y1", "x2y1", "x3y1"] };
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
  expect(gameboard.receiveAttack("x1y1")).toEqual("error");
  expect(gameboard.boardDatabase).toEqual(expectedBoard);
  expect(gameboard.shipsDatabase).toEqual(expectedShips);
});

test("gameboard duplicate recieve attack empty", () => {
  let gameboard = new Gameboard();
  let shipData1 = { name: "ship1", coordinates: ["x1y1", "x2y1", "x3y1"] };
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
  expect(gameboard.receiveAttack(attackCoordinate)).toEqual("error");
  expect(gameboard.boardDatabase).toEqual(expectedBoard);
  expect(gameboard.shipsDatabase).toEqual(expectedShips);
});
