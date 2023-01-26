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
    return (
      node.classList.contains("occupied") && !node.classList.contains(shipId)
    );
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

function checkValidShipPlacement(
  shipId,
  headX,
  headY,
  length,
  orientation,
  gridSize,
  nodes
) {
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
  shipContainer.setAttribute(
    "class",
    `place-ships__ship-container ${orientationClass}`
  );
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

  shipContainer.addEventListener("dragend", () => {
    setTimeout(() => {
      shipContainer.classList.remove("hidden");
    }, 0);
  });

  shipContainer.addEventListener("dblclick", () => {
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
  const newNodes = findNewRotateNodes(
    headX,
    headY,
    shipId,
    newOrientation,
    shipLength,
    GRID_SIZE
  );

  if (newNodes) {
    toggleRotateShipStyles(shipEle, newNodes.targetNodes);
    updateShipGrids(shipId, newNodes.targetNodes);
  }
}

function findNewRotateNodes(
  headX,
  headY,
  shipId,
  newOrientation,
  shipLength,
  gridSize
) {
  for (let i = 0; i < shipLength; i++) {
    for (let j = 0; j < shipLength; j++) {
      const newX =
        newOrientation == "x" ? Number(headX) - i : Number(headX) + j;
      const newY =
        newOrientation == "y" ? Number(headY) - i : Number(headY) + j;

      const isInbounds = checkInbounds(
        newX,
        newY,
        shipLength,
        newOrientation,
        gridSize
      );
      console.log(`x${newX}y${newY} isInbound: ${isInbounds}`);

      if (isInbounds) {
        const targetNodes = getTargetGrids(
          newX,
          newY,
          shipLength,
          newOrientation
        );
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
        const headX =
          data.orientation == "x" ? gridData.x - data.dragoffset : gridData.x;
        const headY =
          data.orientation == "y" ? gridData.y - data.dragoffset : gridData.y;
        const targetGrids = getTargetGrids(
          headX,
          headY,
          data.length,
          data.orientation
        );

        const isValidPlacement = checkValidShipPlacement(
          data.id,
          headX,
          headY,
          data.length,
          data.orientation,
          GRID_SIZE,
          targetGrids
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
  submitButton.className =
    "place-ships__button place-ships__button--submit nes-btn is-success";
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
    const targetGrids = getTargetGrids(
      headX,
      headY,
      ship.shipLength,
      ship.orientation
    );

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
  const maxX =
    randomOrientation == "x" ? boardSize - shipLength - 1 : boardSize - 1;
  const maxY =
    randomOrientation == "y" ? boardSize - shipLength - 1 : boardSize - 1;
  let coordinates = [];

  while (coordinates.length === 0) {
    const randomX = getRandomNumber(maxX);
    const randomY = getRandomNumber(maxY);

    const targetCoordinates = getTargetCoordinates(
      randomX,
      randomY,
      shipLength,
      randomOrientation
    );

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
