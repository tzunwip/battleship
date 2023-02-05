import { GAME } from "../../state/state";

const player1 = {
  name: "player 1",
  color: "red",
  isComputer: false,
};

const player2 = {
  name: "player 2",
  color: "blue",
  isComputer: false,
};

const shipsInput1 = [{ id: "ship1", coordinates: ["x1y1", "x2y1", "x3y1"] }];

test("game to completion", () => {
  GAME.resetGame();

  GAME.createPlayer(player1);
  GAME.createPlayer(player2);

  GAME.placeShips(shipsInput1);
  GAME.placeShips(shipsInput1);

  expect(GAME.isInputComplete(shipsInput1)).toEqual(true);

  GAME.startGame(0);

  expect(GAME.makeAttack({ coordinate: "x1y1", playerId: 1 })).toEqual({
    result: "hit",
  });
  expect(GAME.makeAttack({ coordinate: "x1y2", playerId: 0 })).toEqual({
    result: "miss",
  });

  expect(GAME.makeAttack({ coordinate: "x2y1", playerId: 1 })).toEqual({
    result: "hit",
  });
  expect(GAME.makeAttack({ coordinate: "x2y1", playerId: 0 })).toEqual({
    result: "hit",
  });

  expect(GAME.makeAttack({ coordinate: "x3y1", playerId: 1 })).toEqual({
    result: "won",
    winningPlayer: "player 1",
    ship: { shipLength: 3, status: { x1y1: true, x2y1: true, x3y1: true } },
  });

  GAME.resetGame();

  GAME.createPlayer(player1);
  GAME.createPlayer(player2);

  GAME.placeShips(shipsInput1);
  GAME.placeShips(shipsInput1);

  GAME.startGame(0);

  expect(GAME.makeAttack({ coordinate: "x1y1", playerId: 1 })).toEqual({
    result: "hit",
  });
  expect(GAME.makeAttack({ coordinate: "x1y2", playerId: 0 })).toEqual({
    result: "miss",
  });

  expect(GAME.makeAttack({ coordinate: "x2y1", playerId: 1 })).toEqual({
    result: "hit",
  });
  expect(GAME.makeAttack({ coordinate: "x2y1", playerId: 0 })).toEqual({
    result: "hit",
  });

  expect(GAME.makeAttack({ coordinate: "x3y1", playerId: 1 })).toEqual({
    result: "won",
    winningPlayer: "player 1",
    ship: { shipLength: 3, status: { x1y1: true, x2y1: true, x3y1: true } },
  });

  GAME.resetGame();
});
