import Game from "../game-engine/game";

export const GAME = new Game();

export const GRID_SIZE = 10;

export const SHIPS_CONFIG = [
  { id: "carrier", shipLength: 5 },
  { id: "battleship", shipLength: 4 },
  { id: "cruiser", shipLength: 3 },
  { id: "submarine", shipLength: 3 },
  { id: "destroyer", shipLength: 2 },
];
