import Ship from "../ships";

test("ship 1 position sunk", () => {
  const ship = new Ship(1);
  const expectedStatus = { 1: false };

  expect(ship.shipLength).toEqual(1);
  expect(ship.status).toEqual(expectedStatus);

  ship.hit(1);
  expect(ship.isSunk()).toBe(true);
});

test("ship 3 position not sunk", () => {
  const ship = new Ship(3);
  const expectedStatus1 = { 1: false, 2: false, 3: false };

  expect(ship.shipLength).toEqual(3);
  expect(ship.status).toEqual(expectedStatus1);

  ship.hit(2);
  const expectedStatus2 = { 1: false, 2: true, 3: false };

  expect(ship.status).toEqual(expectedStatus2);
  expect(ship.isSunk()).toBe(false);
});
