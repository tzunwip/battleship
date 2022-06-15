/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
var __webpack_exports__ = {};

;// CONCATENATED MODULE: ./src/components/utility.js
function getEmptyMainElement() {
  const main = document.querySelector("main");

  clearElement(main);

  return main;
}

function clearElement(element) {
  while (element.hasChildNodes()) {
    element.removeChild(element.lastChild);
  }
}

function renderPassDeviceSplash(nextPlayerName, callbackFn) {
  const main = getEmptyMainElement();
  const textDescOne = `Pass device to ${nextPlayerName}`;
  const textDescTwo = "Click to continue";

  const splash = document.createElement("div");
  splash.setAttribute("class", "pass-device nes-container is-rounded");
  main.appendChild(splash);

  const descOne = document.createElement("h3");
  descOne.textContent = textDescOne;
  splash.appendChild(descOne);

  const descTwo = document.createElement("h4");
  descTwo.textContent = textDescTwo;
  splash.appendChild(descTwo);

  splash.addEventListener("click", () => {
    splash.remove();
    callbackFn();
  });
}

function setElementInactive(element) {
  element.classList.add("inactive");
}

function removeElementInactive(element) {
  element.classList.remove("inactive");
}

function toggleElementInactive(element) {
  element.classList.toggle("inactive");
}

function getRandomBinary() {
  return Math.round(Math.random());
}

function getRandomNumber(max) {
  return Math.round(Math.random() * max);
}

function renderGithubIcon() {
  const body = document.querySelector("body");

  const container = document.createElement("a");
  container.href = "https://github.com/tzunwip/battleship";
  container.target = "_blank";
  container.classList = "icon__github";
  body.appendChild(container);

  const icon = document.createElement("i");
  icon.classList = "nes-icon github";
  container.appendChild(icon);
}

;// CONCATENATED MODULE: ./src/game-engine/computer.js



class Computer {
  attackPattern;
  attackHistory = {};
  attackQueue = [];

  constructor(game, playerId) {
    this.playerId = playerId;
    this.game = game;
    this.init();
  }

  init() {
    this.attackPattern = this.generateAttackPattern(GRID_SIZE);
  }

  generateAttackPattern(gridSize) {
    const attackPattern = [];
    const randomBinary = getRandomBinary();

    for (let y = 0; y < gridSize; y++) {
      for (let x = (randomBinary + y) % 2; x < gridSize; x += 2) {
        const gridObject = { x: x, y: y };
        attackPattern.push(gridObject);
      }
    }

    return attackPattern;
  }

  getRandomAttackCoordinate() {
    const randomNumber = getRandomNumber(this.attackPattern.length - 1);
    return { ...this.attackPattern[randomNumber], attackPatternIndex: randomNumber };
  }

  getAttackString(attackCoordinates) {
    return `x${attackCoordinates.x}y${attackCoordinates.y}`;
  }

  sendAttack() {
    const receivingPlayerId = this.playerId ? 0 : 1;
    const attackCoordinate = this.getAttackCoordinate();
    const coordinate = this.getAttackString(attackCoordinate);
    const attackResult = this.game.makeAttack({ coordinate, receivingPlayerId });

    if (attackResult?.result !== "invalid") {
      this.updateAttackHistory();
      this.recordAttack(attackCoordinate, attackResult);
      return { ...attackResult, ...attackCoordinate, receivingPlayerId };
    }

    if (attackResult?.reason == "occupied") {
      this.purgeOccupied(attackResult);
    }
  }

  getAttackCoordinate() {
    if (this.attackQueue.length > 0) {
      return { ...this.attackQueue[0], source: "queue" };
    } else {
      return { ...this.getRandomAttackCoordinate(), source: "pattern" };
    }
  }

  recordAttack(attackCoordinate, attackResult) {
    if (this.attackQueue.length > 0) {
      this.attackQueue.splice(0, 1);
      this.recordAttackWithQueue(attackCoordinate, attackResult);
    } else {
      const index = attackCoordinate.attackPatternIndex;
      this.attackPattern.splice(index, 1);
      this.recordAttackWithoutQueue(attackCoordinate, attackResult);
    }
  }

  recordAttackWithoutQueue(attackCoordinate, attackResult) {
    if (attackResult.result == "hit") {
      this.generateScoutAttackQueue(attackCoordinate, GRID_SIZE);
    }
  }

  recordAttackWithQueue(attackCoordinate, attackResult) {
    this.purgeCoordinateFromAttackPattern(attackCoordinate);

    switch (attackResult.result) {
      case "hit":
        const nextAttack = this.generateAttackInDirection(attackCoordinate, GRID_SIZE);
        if (nextAttack) this.attackQueue.unshift(nextAttack);
        break;
      case "sunk":
        this.resetAttackQueue();

        const unsunkHit = this.searchForUnsunkHit(this.attackHistory);
        if (unsunkHit) this.generateScoutAttackQueue(unsunkHit, GRID_SIZE);
        break;
    }
  }

  updateAttackHistory() {
    const opponentPlayerId = this.playerId ? 0 : 1;
    this.attackHistory = this.game.getPublicBoards()[opponentPlayerId].publicBoard;
  }

  purgeCoordinateFromAttackPattern(attackCoordinate) {
    const index = this.attackPattern.findIndex((obj) => {
      return attackCoordinate.x == obj.x && attackCoordinate.y == obj.y;
    });

    if (index != -1) this.attackPattern.splice(index, 1);
  }

  purgeOccupied(attackResult) {
    if (attackResult.source == "pattern") {
      const index = attackResult.attackPatternIndex;
      this.attackPattern.splice(index, 1);
    }
    if (attackResult.source == "queue") {
      this.attackQueue.splice(0, 1);
    }
  }

  generateScoutAttackQueue(attackCoordinate, gridSize) {
    const directions = ["n", "s", "w", "e"];
    const queue = [];

    directions.forEach((direction) => {
      const obj = this.generateAttackInDirection({ ...attackCoordinate, direction }, gridSize);
      if (obj) {
        return queue.push(obj);
      }
    });

    this.attackQueue = queue;
  }

  generateAttackInDirection({ x, y, direction }, gridSize) {
    switch (direction) {
      // conditionals to check within bounds && not attacked before
      case "n":
        const n = { x, y: y - 1, direction };
        if (n.y >= 0 && !(this.getAttackString(n) in this.attackHistory)) return n;
        break;

      case "s":
        const s = { x, y: y + 1, direction };
        if (s.y < gridSize && !(this.getAttackString(s) in this.attackHistory)) return s;
        break;

      case "w":
        const w = { x: x - 1, y, direction };
        if (w.x >= 0 && !(this.getAttackString(w) in this.attackHistory)) return w;
        break;

      case "e":
        const e = { x: x + 1, y, direction };
        if (e.x < gridSize && !(this.getAttackString(e) in this.attackHistory)) return e;
        break;
    }
  }

  searchForUnsunkHit(attackHistory) {
    const coordinateString = Object.keys(attackHistory).find((coordinate) => {
      return attackHistory[coordinate]?.hasShip && !attackHistory[coordinate]?.isSunk;
    });

    if (coordinateString)
      return { x: Number(coordinateString.charAt(1)), y: Number(coordinateString.charAt(3)) };
  }

  resetAttackQueue() {
    this.attackQueue = [];
  }
}

;// CONCATENATED MODULE: ./src/game-engine/ships.js
class Ship {
  constructor(shipData) {
    this.shipLength = shipData.coordinates.length;
    this.status = {};
    this.init(shipData);
  }

  // populates this.status with coordinate as key, coordinate hit status as false by default
  init(shipData) {
    shipData.coordinates.forEach((position) => {
      this.status[position] = false;
    });
  }

  hit(position) {
    if (position in this.status) {
      this.status[position] = true;
    }
  }

  isSunk() {
    return Object.values(this.status).every((value) => {
      return value;
    });
  }
}

;// CONCATENATED MODULE: ./src/game-engine/gameboard.js


class Gameboard {
  // keys are coordinates, values are {isAttacked: boolean, ship: this.shipsDatabase.id}
  boardDatabase = {};
  // keys are ship id, values are Ship class objects
  shipsDatabase = {};
  shipNamesList = [];

  constructor(playerInput) {
    this.playerName = playerInput.name;
    this.color = playerInput.color;
    this.isComputer = playerInput.isComputer;
  }

  // only works in empty gameboard
  checkPlaceShipValid(newShipInputs) {
    const areGridsEmpty = newShipInputs.coordinates.every((position) => {
      return !(position in this.boardDatabase);
    });
    return areGridsEmpty;
  }

  // shipData {id: '', coordinates: ['x1y1', ...]}
  placeShip(newShipInputs) {
    // catch placement on occupied grids
    if (this.checkPlaceShipValid(newShipInputs) == false) {
      return "invalid placement";
    }

    let newShip = new Ship(newShipInputs);

    // adds newShip to shipsDatabase
    this.shipsDatabase[newShipInputs.id] = newShip;

    // adds ship id to shipNamesList array
    this.shipNamesList.push(newShipInputs.id);

    // adds newShip reference to
    newShipInputs.coordinates.forEach((position) => {
      this.boardDatabase[position] = { ship: this.shipsDatabase[newShipInputs.id] };
    });
  }

  receiveAttack(position) {
    // grid not attacked && no ship
    if (position in this.boardDatabase == false) {
      this.boardDatabase[position] = { isAttacked: true };
      return { result: "miss" };
    }

    let grid = this.boardDatabase[position];

    // grid not attacked && ship
    if ("isAttacked" in grid == false && "ship" in grid == true) {
      grid.isAttacked = true;
      grid.ship.hit(position);
      if (grid.ship.isSunk()) {
        this.setCoordinatesSunk(grid.ship.status);
        return { result: "sunk", ship: grid.ship };
      } else {
        return { result: "hit" };
      }
    }
    // grid attacked already, with ship or no ship
    if (grid.isAttacked == true) {
      return console.error("error receiveAttack(), grid has been attacked already");
    }
  }

  setCoordinatesSunk(status) {
    Object.keys(status).forEach((coordinate) => {
      this.boardDatabase[coordinate].isSunk = true;
    });
  }

  getShipStatus() {
    const shipStatus = this.shipNamesList.reduce((acc, shipName) => {
      let ship = this.shipsDatabase[shipName];
      return { ...acc, [shipName]: ship.isSunk() };
    }, {});

    return shipStatus;
  }

  areAllShipsSunk() {
    const shipStatus = this.getShipStatus();

    return Object.values(shipStatus).every((value) => value);
  }

  getPublicBoard() {
    const boardDatabase = this.boardDatabase;
    const publicBoard = Object.keys(boardDatabase).reduce((acc, key) => {
      const boardDatabaseCoordinate = boardDatabase[key];
      if ("isAttacked" in boardDatabaseCoordinate) {
        return {
          ...acc,
          [key]: {
            isAttacked: true,
            hasShip: "ship" in boardDatabaseCoordinate,
            isSunk: "isSunk" in boardDatabaseCoordinate,
          },
        };
      }
      return acc;
    }, {});

    return {
      playerName: this.playerName,
      color: this.color,
      isComputer: this.isComputer,
      publicBoard,
    };
  }
}

;// CONCATENATED MODULE: ./src/components/game-display.js




function renderGameDisplay() {
  const main = getEmptyMainElement();

  const container = document.createElement("div");
  container.setAttribute("class", "game-display");
  main.appendChild(container);

  renderIndividualGameDisplay(container, 0);
  renderIndividualGameDisplay(container, 1);

  setGameDisplayStyles();
}

function renderIndividualGameDisplay(parent, playerId) {
  const playerData = { ...GAME.players[playerId], playerId };
  const { playerName } = playerData;

  const playerContainer = document.createElement("div");
  playerContainer.setAttribute("class", "game-display__player nes-container");
  playerContainer.setAttribute("id", `player${playerId}`);
  parent.appendChild(playerContainer);

  const nameDiv = document.createElement("h4");
  nameDiv.setAttribute("class", "game-display__player-name");
  nameDiv.textContent = `${playerName}'s Ships`;
  playerContainer.appendChild(nameDiv);

  const boardDiv = document.createElement("div");
  boardDiv.setAttribute("class", "game-display__player-board");
  boardDiv.setAttribute("data-playerid", playerId);
  playerContainer.appendChild(boardDiv);

  renderGameDisplayGrids(boardDiv, playerData);
}

function renderGameDisplayGrids(parent, playerData) {
  const { playerId, boardDatabase } = playerData;
  const isOpponentComputer = GAME.getOpponent(playerId).isComputer;

  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      const coordinate = `x${x}y${y}`;
      const grid = document.createElement("div");
      grid.setAttribute("class", `game-display__grid ${coordinate}`);
      parent.appendChild(grid);

      if (!isOpponentComputer) setGridEventListener({ grid, playerId, coordinate });
      if (isOpponentComputer && coordinate in boardDatabase) setRevealShipStyle(grid);
    }
  }
}

function setGameDisplayStyles() {
  const activePlayerId = GAME.activePlayer;
  const inactivePlayerId = activePlayerId ? 0 : 1;
  const playerElements = [document.querySelector("#player0"), document.querySelector("#player1")];
  const isAutoGameMode = GAME.config.mode == "auto";

  // only opponent's board should stand out
  if (!isAutoGameMode) {
    setElementInactive(playerElements[activePlayerId]);
    removeElementInactive(playerElements[inactivePlayerId]);
  }
}

function setGridStyle(grid, attackResult) {
  switch (attackResult.result) {
    case "hit":
      setGridHitStyle(grid);
      break;
    case "miss":
      setGridMissStyle(grid);
      break;
    case "sunk":
      setSunkShipStyle(grid, attackResult);
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
  faSpan.setAttribute("class", "nes-icon close");
}

function setGridMissStyle(grid) {
  const faSpan = document.createElement("i");
  grid.classList.add("miss");
  grid.appendChild(faSpan);
  faSpan.setAttribute("class", "fas fa-square-full");
}

function setSunkShipStyle(grid, attackResult) {
  const board = grid.parentElement;
  const sunkShipCoordinates = Object.keys(attackResult.ship.status);
  const queryString = `.${sunkShipCoordinates.join(", .")}`;
  const sunkShipGrids = board.querySelectorAll(queryString);

  sunkShipGrids.forEach((grid) => {
    grid.classList.remove("hit", "reveal");
    grid.classList.add("sunk");
    clearElement(grid);
  });
}

function setRevealShipStyle(grid) {
  if (!grid.classList.contains("sunk")) grid.classList.add("reveal");
}

function renderComputerAttack(attackResult) {
  if (!attackResult) return;

  const { receivingPlayerId, x, y } = attackResult;

  const grid = document.querySelector(`#player${receivingPlayerId} .x${x}y${y}`);

  setGridStyle(grid, attackResult);
  setGameDisplayStyles();
}

function renderGameWonPopup(winningPlayerName) {
  const body = document.querySelector("body");

  const mask = document.createElement("div");
  mask.setAttribute("class", "mask");
  body.appendChild(mask);

  const container = document.createElement("div");
  container.setAttribute("class", "win-popup nes-container is-rounded");
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

function setGridEventListener({ grid, playerId, coordinate }) {
  grid.addEventListener("click", () => {
    const attackResult = GAME.makeAttack({ coordinate, receivingPlayerId: playerId });
    setGameDisplayStyles();
    setGridStyle(grid, attackResult);
  });
}

;// CONCATENATED MODULE: ./src/game-engine/game.js




class Game {
  players = [];
  activePlayer = 0;
  hasStarted = false;
  computer = {};
  config = { mode: "" };

  createPlayer(newPlayerInput) {
    if (this.players.length >= 2) return;

    if (newPlayerInput.isComputer) {
      this.computer[this.activePlayer] = new Computer(this, this.activePlayer);
    }

    this.players.push(new Gameboard(newPlayerInput));

    this.advanceTurn();
  }

  placeShips(shipsInput) {
    const activeBoard = this.players[this.activePlayer];

    shipsInput.forEach((newShipInput) => {
      activeBoard.placeShip(newShipInput);
    });

    this.advanceTurn();

    return activeBoard;
  }

  advanceTurn() {
    if (this.activePlayer) {
      this.activePlayer = 0;
    } else {
      this.activePlayer = 1;
    }
  }

  getMyName() {
    return this.players[this.activePlayer].playerName;
  }

  getOpponentsName() {
    return this.getOpponent().playerName;
  }

  getOpponent(playerId = this.activePlayer) {
    if (playerId == 1) {
      return this.players[0];
    } else {
      return this.players[1];
    }
  }

  getPublicBoards() {
    return [this.players[0].getPublicBoard(), this.players[1].getPublicBoard()];
  }

  getMyBoard() {
    return this.players[this.activePlayer].boardDatabase;
  }

  isInputComplete(requiredShips) {
    const arePlayerBoardsPopulated = this.players.every((player) => {
      return requiredShips.every((ship) => {
        return ship.id in player.shipsDatabase;
      });
    });

    return arePlayerBoardsPopulated;
  }

  startGame(firstMover) {
    if (!this.hasStarted) {
      this.hasStarted = 1;
      this.activePlayer = firstMover;
    }

    if (this.checkAutoMode()) this.config.mode = "auto";

    if (this.players[this.activePlayer].isComputer) {
      this.makeComputerAttack();
    }
  }

  makeComputerAttack() {
    setTimeout(() => {
      const attackResult = this.computer[this.activePlayer].sendAttack();
      renderComputerAttack(attackResult);
    }, 1000);
  }

  makeAttack({ coordinate, receivingPlayerId }) {
    // checks input origintes from opponent board only
    if (receivingPlayerId == this.activePlayer) {
      console.error("invalid playerId");
      return { result: "invalid", reason: "playerId" };
    }

    const opponentPlayer = this.getOpponent();
    const attackResult = opponentPlayer.receiveAttack(coordinate);
    const hasOpponentLost = opponentPlayer.areAllShipsSunk();

    // check if attack valid
    if (!attackResult) {
      console.error("invalid attack");
      return { result: "invalid", reason: "occupied" };
    }

    // check winning condition
    if (attackResult.result == "sunk" && hasOpponentLost) {
      return { result: "won", winningPlayer: this.getMyName(), ship: attackResult.ship };
    }

    this.advanceTurn();

    if (opponentPlayer.isComputer) this.makeComputerAttack();

    return attackResult;
  }

  resetGame() {
    this.players = [];
    this.activePlayer = 0;
    this.hasStarted = false;
  }

  checkAutoMode() {
    return this.players[0].isComputer && this.players[1].isComputer;
  }
}

;// CONCATENATED MODULE: ./src/state/state.js


const GAME = new Game();

const GRID_SIZE = 10;

const SHIPS_CONFIG = [
  { id: "carrier", shipLength: 5 },
  { id: "battleship", shipLength: 4 },
  { id: "cruiser", shipLength: 3 },
  { id: "submarine", shipLength: 3 },
  { id: "destroyer", shipLength: 2 },
];

;// CONCATENATED MODULE: ./src/components/select-player.js




function renderSelectPlayer() {
  const main = getEmptyMainElement();
  const titleText = "Select First Mover:";
  const playerOneName = GAME.getMyName();
  const playerTwoName = GAME.getOpponentsName();
  const randomButtonText = "Random";

  const container = document.createElement("div");
  container.setAttribute("class", "select-player nes-container");
  main.appendChild(container);

  const title = document.createElement("h4");
  title.setAttribute("class", "select-player__title");
  title.textContent = titleText;
  container.appendChild(title);

  const playerOneButton = document.createElement("button");
  playerOneButton.setAttribute("class", "select-player__button nes-btn");
  playerOneButton.type = "button";
  playerOneButton.textContent = playerOneName;
  container.appendChild(playerOneButton);

  const playerTwoButton = document.createElement("button");
  playerTwoButton.setAttribute("class", "select-player__button nes-btn");
  playerTwoButton.type = "button";
  playerTwoButton.textContent = playerTwoName;
  container.appendChild(playerTwoButton);

  const randomButton = document.createElement("button");
  randomButton.setAttribute("class", "select-player__button nes-btn is-warning");
  randomButton.type = "button";
  randomButton.textContent = randomButtonText;
  container.appendChild(randomButton);

  // event listeners
  playerOneButton.addEventListener("click", () => {
    GAME.startGame(0);
    renderGameDisplay();
  });

  playerTwoButton.addEventListener("click", () => {
    GAME.startGame(1);
    renderGameDisplay();
  });

  randomButton.addEventListener("click", () => {
    const randomNumber = getRandomBinary();
    GAME.startGame(randomNumber);
    renderGameDisplay();
  });
}

;// CONCATENATED MODULE: ./src/components/place-ships.js




function renderPlaceShips() {
  const main = getEmptyMainElement();
  const activePlayerName = GAME.getMyName();
  const titleText = `${activePlayerName}'s Ships`;
  const descTextOne = "Drag and drop, double click to rotate";

  const container = document.createElement("div");
  container.className = "place-ships nes-container";
  main.appendChild(container);

  const title = document.createElement("h3");
  title.textContent = titleText;
  title.className = "place-ships__title";
  container.appendChild(title);

  const board = document.createElement("div");
  board.className = "place-ships__board";
  renderPlaceShipGrids(board);
  container.appendChild(board);

  const desc = document.createElement("div");
  desc.className = "place-ships__desc nes-text is-error";
  container.appendChild(desc);

  const descOne = document.createElement("h6");
  descOne.textContent = descTextOne;
  desc.appendChild(descOne);

  renderRandomizedBoard(randomizeShips(SHIPS_CONFIG, GRID_SIZE));

  renderSubmitButton(container);
  renderRandomizeButton(container);
}

function getTargetGrids(headX, headY, length, orientation) {
  let idArray = getTargetCoordinates(headX, headY, length, orientation);

  return idArray.map((id) => {
    return document.getElementById(id);
  });
}

function checkOccupied(nodes, shipId) {
  const isOccupied = nodes.some((node) => {
    return node.classList.contains("occupied") && !node.classList.contains(shipId);
  });

  return isOccupied;
}

function checkInbounds(headX, headY, length, orientation, gridSize) {
  const maxCoordinate = gridSize - length;

  switch (orientation) {
    case "x":
      return headX <= maxCoordinate ? true : false;
    case "y":
      return headY <= maxCoordinate ? true : false;
  }
}

function checkValidShipPlacement(shipId, headX, headY, length, orientation, gridSize, nodes) {
  const isInbounds = checkInbounds(headX, headY, length, orientation, gridSize);

  // If ship placement outside board, isOccupied() returns error
  if (!isInbounds) return false;
  const isOccupied = checkOccupied(nodes, shipId);

  return !isOccupied;
}

function updateShipGrids(shipId, newNodes) {
  const oldNodes = document.querySelectorAll(`.${shipId}`);

  oldNodes.forEach((node) => {
    node.classList.remove(shipId);
    node.classList.remove("occupied");
  });
  newNodes.forEach((node) => {
    node.classList.add(shipId);
    node.classList.add("occupied");
  });
}

function renderShip(parent, { id, shipLength, orientation = "y" }) {
  const shipContainer = document.createElement("div");

  // set ship styles
  const orientationClass = orientation == "y" ? "grid-column" : "grid-row";
  shipContainer.setAttribute("class", `place-ships__ship-container ${orientationClass}`);
  shipContainer.setAttribute("draggable", "true");
  shipContainer.setAttribute("id", id);
  shipContainer.setAttribute("data-orientation", orientation);
  shipContainer.setAttribute("data-length", shipLength);
  parent.appendChild(shipContainer);

  // event listeners
  shipContainer.addEventListener("dragstart", (e) => {
    e.dataTransfer.dropEffect = "move";
    e.dataTransfer.effectAllowed = "move";
    const data = {
      id,
      dragoffset: e.target.dataset.dragoffset,
      orientation: e.target.dataset.orientation,
      length: shipLength,
    };
    e.dataTransfer.setData("text/plain", JSON.stringify(data));
    setTimeout(() => {
      shipContainer.classList.add("hidden");
    }, 0);
  });

  shipContainer.addEventListener("dragend", (e) => {
    setTimeout(() => {
      shipContainer.classList.remove("hidden");
    }, 0);
  });

  shipContainer.addEventListener("dblclick", (e) => {
    rotateShip(shipContainer);
  });

  // render ship grid
  for (let i = 0; i < shipLength; i++) {
    const shipGrid = document.createElement("div");
    shipGrid.className = "place-ships__ship-grid";
    shipGrid.addEventListener("mousedown", (e) => {
      const parent = e.target.parentElement;

      parent.setAttribute("data-dragOffset", i);
    });
    shipContainer.appendChild(shipGrid);
  }
}

function rotateShip(shipEle) {
  const shipDataset = shipEle.dataset;
  const gridDataset = shipEle.parentElement.dataset;
  const shipId = shipEle.id;
  const headX = gridDataset.x;
  const headY = gridDataset.y;
  const shipLength = shipDataset.length;
  const oldOrientation = shipDataset.orientation;
  const newOrientation = oldOrientation == "x" ? "y" : "x";
  const newNodes = findNewRotateNodes(headX, headY, shipId, newOrientation, shipLength, GRID_SIZE);

  if (newNodes) {
    toggleRotateShipStyles(shipEle, newNodes.targetNodes);
    updateShipGrids(shipId, newNodes.targetNodes);
  }
}

function findNewRotateNodes(headX, headY, shipId, newOrientation, shipLength, gridSize) {
  for (let i = 0; i < shipLength; i++) {
    for (let j = 0; j < shipLength; j++) {
      const newX = newOrientation == "x" ? Number(headX) - i : Number(headX) + j;
      const newY = newOrientation == "y" ? Number(headY) - i : Number(headY) + j;

      const isInbounds = checkInbounds(newX, newY, shipLength, newOrientation, gridSize);
      console.log(`x${newX}y${newY} isInbound: ${isInbounds}`);

      if (isInbounds) {
        const targetNodes = getTargetGrids(newX, newY, shipLength, newOrientation);
        const isOccupied = checkOccupied(targetNodes, shipId);
        if (!isOccupied) {
          console.log(targetNodes, `isOccupied: ${isOccupied}`);
          return { newX, newY, targetNodes };
        }
      }
    }
  }
}

function toggleRotateShipStyles(shipEle, newNodes) {
  shipEle.classList.toggle("grid-row");
  shipEle.classList.toggle("grid-column");
  shipEle.dataset.orientation = shipEle.dataset.orientation == "x" ? "y" : "x";

  newNodes[0].appendChild(shipEle);
}

function renderPlaceShipGrids(board) {
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      const grid = document.createElement("div");

      // set attributes
      grid.setAttribute("data-x", `${x}`);
      grid.setAttribute("data-y", `${y}`);
      grid.id = `x${x}y${y}`;
      grid.className = "place-ships__grid";
      board.appendChild(grid);

      // set event listeners
      grid.addEventListener("dragover", (e) => e.preventDefault());
      grid.addEventListener("dragenter", (e) => e.preventDefault());
      grid.addEventListener("drop", (e) => {
        const data = JSON.parse(e.dataTransfer.getData("text/plain"));
        const gridData = e.target.dataset;
        const headX = data.orientation == "x" ? gridData.x - data.dragoffset : gridData.x;
        const headY = data.orientation == "y" ? gridData.y - data.dragoffset : gridData.y;
        const targetGrids = getTargetGrids(headX, headY, data.length, data.orientation);

        const isValidPlacement = checkValidShipPlacement(
          data.id,
          headX,
          headY,
          data.length,
          data.orientation,
          GRID_SIZE,
          targetGrids,
        );

        if (!isValidPlacement) throw new Error("invalid ship placement");

        const shipId = data.id;
        updateShipGrids(shipId, targetGrids);

        const headId = `x${headX}y${headY}`;
        const headGrid = document.getElementById(headId);
        const targetShip = document.getElementById(data.id);
        headGrid.appendChild(targetShip);

        e.dataTransfer.clearData();
      });
    }
  }
}

function resetPlaceBoard() {
  const board = document.querySelector(".place-ships__board");

  clearElement(board);

  renderPlaceShipGrids(board);
}

function renderSubmitButton(parent) {
  const submitButton = document.createElement("button");
  submitButton.textContent = "Continue";
  submitButton.type = "button";
  submitButton.className = "place-ships__button place-ships__button--submit nes-btn is-success";
  parent.appendChild(submitButton);
  submitButton.addEventListener("click", () => {
    const ships = getPlacedShips(SHIPS_CONFIG);
    const nextPlayer = GAME.getOpponent();

    GAME.placeShips(ships);

    if (nextPlayer.playerName == "Computer" && nextPlayer.isComputer) {
      const randomizedShips = randomizeShips(SHIPS_CONFIG, GRID_SIZE);
      GAME.placeShips(randomizedShips);
    }

    if (GAME.isInputComplete(SHIPS_CONFIG)) {
      renderSelectPlayer();
    } else {
      renderPassDeviceSplash(nextPlayer.playerName, renderPlaceShips);
    }
  });
}

function renderRandomizeButton(parent) {
  const randomizeButton = document.createElement("button");
  randomizeButton.textContent = "Randomize";
  randomizeButton.type = "button";
  randomizeButton.className =
    "place-ships__button place-ships__button--randomize nes-btn is-warning";
  parent.appendChild(randomizeButton);
  randomizeButton.addEventListener("click", () => {
    const randomizedShips = randomizeShips(SHIPS_CONFIG, GRID_SIZE);
    renderRandomizedBoard(randomizedShips);
  });
}

function getPlacedShips(SHIPS_CONFIG) {
  return SHIPS_CONFIG.reduce((acc, ship) => {
    const shipGrids = document.querySelectorAll(`.${ship.id}`);
    const shipCoordinates = [];
    shipGrids.forEach((node) => {
      shipCoordinates.push(node.id);
    });

    return [...acc, { id: ship.id, coordinates: shipCoordinates }];
  }, []);
}

function renderRandomizedBoard(randomizedShips) {
  resetPlaceBoard();

  randomizedShips.forEach((ship) => {
    const headCoordinate = ship.coordinates[0];
    const headX = headCoordinate.charAt(1);
    const headY = headCoordinate.charAt(3);
    const headGrid = document.querySelector(`#${headCoordinate}`);
    const targetGrids = getTargetGrids(headX, headY, ship.shipLength, ship.orientation);

    renderShip(headGrid, ship);
    updateShipGrids(ship.id, targetGrids);
  });
}

function randomizeShips(shipsConfig, boardSize) {
  // shipData = {id, length, coordinates: []}
  const ships = [];
  let occupiedCoordinates = [];

  shipsConfig.forEach((shipConfig) => {
    const newShip = randomPlaceShip(shipConfig, occupiedCoordinates, boardSize);

    ships.push(newShip);
    occupiedCoordinates = [...occupiedCoordinates, ...newShip.coordinates];
  });

  return ships;
}

function randomPlaceShip({ id, shipLength }, occupiedCoordinates, boardSize) {
  const randomOrientation = getRandomBinary() ? "x" : "y";
  const maxX = randomOrientation == "x" ? boardSize - shipLength - 1 : boardSize - 1;
  const maxY = randomOrientation == "y" ? boardSize - shipLength - 1 : boardSize - 1;
  let coordinates = [];

  while (coordinates.length === 0) {
    const randomX = getRandomNumber(maxX);
    const randomY = getRandomNumber(maxY);

    const targetCoordinates = getTargetCoordinates(randomX, randomY, shipLength, randomOrientation);

    const isInvalid = targetCoordinates.some((targetCoord) => {
      return occupiedCoordinates.some((occupiedCoord) => {
        return occupiedCoord == targetCoord;
      });
    });

    if (!isInvalid) {
      coordinates = targetCoordinates;
      break;
    }
  }

  return {
    id,
    shipLength,
    coordinates,
    orientation: randomOrientation,
  };
}

function getTargetCoordinates(headX, headY, length, orientation) {
  let idArray = [];

  switch (orientation) {
    case "x":
      for (let i = 0; i < length; i++) {
        idArray.push(`x${Number(headX) + i}y${headY}`);
      }
      break;
    case "y":
      for (let i = 0; i < length; i++) {
        idArray.push(`x${headX}y${Number(headY) + i}`);
      }
      break;
  }

  return idArray;
}

;// CONCATENATED MODULE: ./src/components/name-input.js




function renderNameInput() {
  const main = getEmptyMainElement();
  const isPvp = GAME.config.mode == "pvp" ? true : false;
  const titleText = `Enter your name${isPvp ? "s" : ""}:`;
  const inputOnePlaceholder = isPvp ? "Player One" : "Player";
  const inputTwoPlaceholder = "Player Two";
  const buttonText = "Continue";
  const computerInput = {
    name: "Computer",
    isComputer: true,
  };

  const form = document.createElement("form");
  form.className = "name-input nes-container";
  main.appendChild(form);

  const title = document.createElement("h4");
  title.textContent = titleText;
  title.className = "name-input__title";
  form.appendChild(title);

  renderInputFields(form, 0, inputOnePlaceholder);

  if (isPvp) {
    renderInputFields(form, 1, inputTwoPlaceholder);
  }

  const button = document.createElement("button");
  button.textContent = buttonText;
  button.type = "submit";
  button.className = "name-input__button nes-btn is-success";
  form.appendChild(button);

  // add event listener submit
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const inputElements = e.target.elements;

    [0, 1].forEach((index) => {
      const newPlayerInput = inputElements[`name${index}`]
        ? {
            name: inputElements[`name${index}`].value,
            isComputer: inputElements[`auto${index}`].checked,
          }
        : { name: "Computer", isComputer: true };

      GAME.createPlayer(newPlayerInput);
    });

    renderPlaceShips();
  });
}

function renderInputFields(parent, index, placeholder) {
  const fragment = document.createDocumentFragment();

  const nameInput = document.createElement("input");
  nameInput.name = `name${index}`;
  nameInput.placeholder = placeholder;
  nameInput.required = "true";
  nameInput.type = "text";
  nameInput.autocomplete = "off";
  nameInput.className = "name-input__text-input nes-input";
  fragment.appendChild(nameInput);

  const autoLabel = document.createElement("label");
  autoLabel.className = "name-input__auto-label";
  fragment.appendChild(autoLabel);

  const autoCheckbox = document.createElement("input");
  autoCheckbox.name = `auto${index}`;
  autoCheckbox.type = "checkbox";
  autoCheckbox.className = "nes-checkbox";
  autoLabel.appendChild(autoCheckbox);

  const autoSpan = document.createElement("span");
  autoSpan.textContent = "Auto";
  autoLabel.appendChild(autoSpan);

  parent.appendChild(fragment);
}

;// CONCATENATED MODULE: ./src/components/start.js




function renderStart() {
  const main = getEmptyMainElement();
  const titleText = "Battleship";
  const descText = "Start Game";
  const computerText = "1 Player";
  const pvpText = "2 Players";

  const container = document.createElement("div");
  container.className = "start nes-container";

  const gameTitle = document.createElement("h1");
  gameTitle.textContent = titleText;
  gameTitle.className = "start__title";
  container.appendChild(gameTitle);

  const gameDesc = document.createElement("h4");
  gameDesc.textContent = descText;
  gameDesc.className = "start__desc";
  container.appendChild(gameDesc);

  const vsComputerButton = document.createElement("button");
  vsComputerButton.textContent = computerText;
  vsComputerButton.type = "button";
  vsComputerButton.className = "start__button nes-btn";
  vsComputerButton.addEventListener("click", () => {
    GAME.resetGame();
    GAME.config.mode = "computer";
    renderNameInput();
  });
  container.appendChild(vsComputerButton);

  const pvpButton = document.createElement("button");
  pvpButton.textContent = pvpText;
  pvpButton.type = "button";
  pvpButton.className = "start__button nes-btn";
  pvpButton.addEventListener("click", () => {
    GAME.resetGame();
    GAME.config.mode = "pvp";
    renderNameInput();
  });
  container.appendChild(pvpButton);

  main.appendChild(container);
}

;// CONCATENATED MODULE: ./src/index.js




renderStart();
renderGithubIcon();

/******/ })()
;