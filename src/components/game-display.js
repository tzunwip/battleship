import { GAME, GRID_SIZE } from "../state/state";
import {
  getEmptyMainElement,
  setElementInactive,
  removeElementInactive,
  clearElement,
} from "./utility";
import renderStart from "./start";

export function renderGameDisplay() {
  const main = getEmptyMainElement();

  const container = document.createElement("div");
  container.setAttribute("class", "game-display");
  main.appendChild(container);

  const publicPlayerBoards = GAME.getPublicBoards();
  renderPlayerGameDisplay(container, 0, publicPlayerBoards[0].playerName);
  renderPlayerGameDisplay(container, 1, publicPlayerBoards[1].playerName);

  setGameDisplayStyles();
}

function renderPlayerGameDisplay(parent, playerId, playerName) {
  const playerContainer = document.createElement("div");
  playerContainer.setAttribute("class", "game-display__player");
  playerContainer.setAttribute("id", `player${playerId}`);
  parent.appendChild(playerContainer);

  const nameDiv = document.createElement("h4");
  nameDiv.setAttribute("class", "game-display__player-name");
  nameDiv.textContent = `${playerName}'s Board`;
  playerContainer.appendChild(nameDiv);

  const boardDiv = document.createElement("div");
  boardDiv.setAttribute("class", "game-display__player-board");
  boardDiv.setAttribute("data-playerid", playerId);
  playerContainer.appendChild(boardDiv);

  renderGameDisplayGrids(boardDiv, playerId);

  const shipStatus = document.createElement("div");
  playerContainer.appendChild(shipStatus);
}

function renderGameDisplayGrids(parent, playerId) {
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      const coordinate = `x${x}y${y}`;
      const grid = document.createElement("div");
      grid.setAttribute("class", `game-display__grid ${coordinate}`);
      parent.appendChild(grid);

      grid.addEventListener("click", () => {
        const attackResult = GAME.makeAttack({ coordinate, playerId });
        setGameDisplayStyles();
        setGridStyle(grid, attackResult);
      });
    }
  }
}

function setGameDisplayStyles() {
  const activePlayerId = GAME.getActivePlayerId();
  const inactivePlayerId = activePlayerId ? 0 : 1;
  const playerElements = [document.querySelector("#player0"), document.querySelector("#player1")];

  // only opponent's board should stand out
  setElementInactive(playerElements[activePlayerId]);
  removeElementInactive(playerElements[inactivePlayerId]);
}

function setGridStyle(grid, attackResult) {
  switch (attackResult.result) {
    case "hit":
      setGridHitStyle(grid);
      console.log(attackResult);
      break;
    case "miss":
      setGridMissStyle(grid);
      break;
    case "sunk":
      setSunkShipStyle(grid, attackResult);
      console.log(attackResult);
      break;
    case "won":
      setSunkShipStyle(grid, attackResult);
      renderGameWonPopup(attackResult.winningPlayer);
      break;
  }
}

function setGridHitStyle(grid) {
  const faSpan = document.createElement("i");
  grid.classList.add("hit");
  grid.appendChild(faSpan);
  faSpan.setAttribute("class", "fas fa-skull-crossbones");
}

function setGridMissStyle(grid) {
  const faSpan = document.createElement("i");
  grid.classList.add("miss");
  grid.appendChild(faSpan);
  faSpan.setAttribute("class", "fas fa-circle");
}

function setSunkShipStyle(grid, attackResult) {
  const board = grid.parentElement;
  const sunkShipCoordinates = Object.keys(attackResult.ship.status);
  const queryString = `.${sunkShipCoordinates.join(", .")}`;
  const sunkShipGrids = board.querySelectorAll(queryString);

  sunkShipGrids.forEach((grid) => {
    grid.classList.remove("hit");
    grid.classList.add("sunk");
    clearElement(grid);
  });
}

function renderGameWonPopup(winningPlayerName) {
  const body = document.querySelector("body");

  const mask = document.createElement("div");
  mask.setAttribute("class", "mask");
  body.appendChild(mask);

  const container = document.createElement("div");
  container.setAttribute("class", "win-popup");
  mask.appendChild(container);

  const textOne = document.createElement("h3");
  textOne.setAttribute("class", "win-popup__text");
  textOne.textContent = `${winningPlayerName} has won!`;
  container.appendChild(textOne);

  const textTwo = document.createElement("h4");
  textTwo.setAttribute("class", "win-popup__text");
  textTwo.textContent = `Click to play again`;
  container.appendChild(textTwo);

  mask.addEventListener("click", () => {
    mask.remove();
    renderStart();
  });
}
