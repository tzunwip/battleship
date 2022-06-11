import {
  clearElement,
  getEmptyMainElement,
  getRandomBinary,
  getRandomNumber,
  renderPassDeviceSplash,
} from "./utility";
import { GAME, SHIPS_CONFIG, GRID_SIZE } from "../state/state";
import { renderSelectPlayer } from "./select-player";

export function renderPlaceShips() {
  const main = getEmptyMainElement();
  const activePlayerName = GAME.getMyName();
  const titleText = `${activePlayerName}, place your ships`;
  const descTextOne = "Drag and drop";
  const descTextTwo = "Double click to rotate";

  const container = document.createElement("div");
  container.className = "place-ships";
  main.appendChild(container);

  const title = document.createElement("h5");
  title.textContent = titleText;
  title.className = "place-ships__title";
  container.appendChild(title);

  const board = document.createElement("div");
  board.className = "place-ships__board";
  renderPlaceShipGrids(board);
  container.appendChild(board);

  const desc = document.createElement("div");
  desc.className = "place-ships__desc";
  container.appendChild(desc);

  const descOne = document.createElement("h6");
  descOne.textContent = descTextOne;
  desc.appendChild(descOne);

  const descTwo = document.createElement("h6");
  descTwo.textContent = descTextTwo;
  desc.appendChild(descTwo);

  const staging = document.createElement("div");
  staging.className = "place-ships__staging";
  staging.id = "staging";
  container.appendChild(staging);

  renderNextStagingElement(SHIPS_CONFIG);

  const resetButton = document.createElement("button");
  resetButton.textContent = "Reset";
  resetButton.type = "button";
  resetButton.className = "place-ships__button place-ships__button--reset";
  container.appendChild(resetButton);
  resetButton.addEventListener("click", () => {
    resetPlaceBoard();
  });

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

function renderNextStagingElement(shipsConfig) {
  const stagingEle = document.querySelector(".place-ships__staging");
  if (stagingEle.hasChildNodes()) return;

  const nextShip = shipsConfig.find((ship) => {
    const shipEle = document.querySelector(`#${ship.id}`);
    return shipEle == null;
  });

  if (nextShip) renderShip(stagingEle, nextShip);
  else renderSubmitButton(stagingEle);
}

function rotateShip(shipEle) {
  if (shipEle.parentElement.id == "staging") {
    toggleRotateShipStyles(shipEle);
    return;
  }

  const shipDataset = shipEle.dataset;
  const gridDataset = shipEle.parentElement.dataset;
  const shipId = shipEle.id;
  const headX = gridDataset.x;
  const headY = gridDataset.y;
  const shipLength = shipDataset.length;
  const oldOrientation = shipDataset.orientation;
  const newOrientation = oldOrientation == "x" ? "y" : "x";
  const newNodes = getTargetGrids(headX, headY, shipLength, newOrientation);

  const isValidPlacement = checkValidShipPlacement(
    shipId,
    headX,
    headY,
    shipLength,
    newOrientation,
    GRID_SIZE,
    newNodes,
  );

  if (isValidPlacement) {
    const oldNodes = getTargetGrids(headX, headY, shipLength, oldOrientation);
    toggleRotateShipStyles(shipEle);
    updateShipGrids(shipId, oldNodes, newNodes);
  }
}

function toggleRotateShipStyles(shipEle) {
  shipEle.classList.toggle("grid-row");
  shipEle.classList.toggle("grid-column");
  shipEle.dataset.orientation = shipEle.dataset.orientation == "x" ? "y" : "x";
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

        renderNextStagingElement(SHIPS_CONFIG);
      });
    }
  }
}

function resetPlaceBoard() {
  const board = document.querySelector(".place-ships__board");
  const staging = document.querySelector(".place-ships__staging");

  [board, staging].forEach((node) => {
    clearElement(node);
  });

  renderPlaceShipGrids(board);
  renderNextStagingElement(SHIPS_CONFIG);
}

function renderSubmitButton(parent) {
  const submitButton = document.createElement("button");
  submitButton.textContent = "Submit";
  submitButton.type = "button";
  submitButton.className = "place-ships__button";
  parent.appendChild(submitButton);
  submitButton.addEventListener("click", () => {
    const ships = getPlacedShips(SHIPS_CONFIG);
    const nextPlayer = GAME.getOpponent();

    GAME.placeShips(ships);

    if (nextPlayer.isComputer) {
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
  randomizeButton.className = "place-ships__button place-ships__button--randomize";
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

  clearElement(document.querySelector("#staging"));
  renderNextStagingElement(SHIPS_CONFIG);
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
