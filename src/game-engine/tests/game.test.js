import Game from "../game";

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

const computer = {
  name: "computer",
  color: "green",
  isComputer: true,
};

const shipsInput1 = [
  { id: "ship1", coordinates: ["x1y1", "x2y1", "x3y1"] },
  // { id: "ship2", coordinates: ["x1y3", "x2y3", "x3y3"] },
];

test("game to completion", () => {
  const game = new Game();

  game.createPlayer(player1);
  game.createPlayer(player2);

  game.placeShips(shipsInput1);
  game.placeShips(shipsInput1);

  expect(game.isInputComplete(shipsInput1)).toEqual(true);

  game.startGame(0);

  expect(game.makeAttack({ coordinate: "x1y1", playerId: 1 })).toEqual({ result: "hit" });
  expect(game.makeAttack({ coordinate: "x1y2", playerId: 0 })).toEqual({ result: "miss" });

  expect(game.makeAttack({ coordinate: "x2y1", playerId: 1 })).toEqual({ result: "hit" });
  expect(game.makeAttack({ coordinate: "x2y1", playerId: 0 })).toEqual({ result: "hit" });

  expect(game.makeAttack({ coordinate: "x3y1", playerId: 1 })).toEqual({
    result: "won",
    winningPlayer: "player 1",
    ship: { shipLength: 3, status: { x1y1: true, x2y1: true, x3y1: true } },
  });

  game.resetGame();

  game.createPlayer(player1);
  game.createPlayer(player2);

  game.placeShips(shipsInput1);
  game.placeShips(shipsInput1);

  game.startGame(0);

  expect(game.makeAttack({ coordinate: "x1y1", playerId: 1 })).toEqual({ result: "hit" });
  expect(game.makeAttack({ coordinate: "x1y2", playerId: 0 })).toEqual({ result: "miss" });

  expect(game.makeAttack({ coordinate: "x2y1", playerId: 1 })).toEqual({ result: "hit" });
  expect(game.makeAttack({ coordinate: "x2y1", playerId: 0 })).toEqual({ result: "hit" });

  expect(game.makeAttack({ coordinate: "x3y1", playerId: 1 })).toEqual({
    result: "won",
    winningPlayer: "player 1",
    ship: { shipLength: 3, status: { x1y1: true, x2y1: true, x3y1: true } },
  });
});
