import Ship from "../ships";

test("ship 1 position sunk", () => {
  const shipData = { name: "ship1", coordinates: ["x1y1"] };
  const ship = new Ship(shipData);
  const expectedStatus = { x1y1: false };

  expect(ship.shipLength).toEqual(1);
  expect(ship.status).toEqual(expectedStatus);

  ship.hit("x1y1");
  expect(ship.isSunk()).toBe(true);
});

test("ship 3 position not sunk", () => {
  const shipData = { name: "ship2", coordinates: ["x1y1", "x2y1", "x3y1"] };
  const ship = new Ship(shipData);
  const expectedStatus1 = { x1y1: false, x2y1: false, x3y1: false };

  expect(ship.shipLength).toEqual(3);
  expect(ship.status).toEqual(expectedStatus1);

  ship.hit("x2y1");
  const expectedStatus2 = { x1y1: false, x2y1: true, x3y1: false };

  expect(ship.status).toEqual(expectedStatus2);
  expect(ship.isSunk()).toBe(false);
});
