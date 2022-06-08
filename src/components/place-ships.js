import { clearElement, getEmptyMainElement, renderPassDeviceSplash } from "./utility";
import { GAME, SHIPS_CONFIG, GRID_SIZE } from "../state/state";
import { renderSelectPlayer } from "./select-player";

export function renderPlaceShips() {
  const main = getEmptyMainElement();
  const activePlayerName = GAME.getMyName();
  const titleText = `${activePlayerName}, place your ships`;
  const descText = "Drag and drop";

  const container = document.createElement("div");
  container.className = "place-ships";
  main.appendChild(container);

  const title = document.createElement("h4");
  title.textContent = titleText;
  title.className = "place-ships__title";
  container.appendChild(title);

  const board = document.createElement("div");
  board.className = "place-ships__board";
  renderPlaceShipGrids(board);
  container.appendChild(board);

  const desc = document.createElement("h5");
  desc.textContent = descText;
  desc.className = "place-ships__desc";
  container.appendChild(desc);

  const staging = document.createElement("div");
  staging.className = "place-ships__staging";
  staging.id = "staging";
  container.appendChild(staging);

  renderNextStagingElement(SHIPS_CONFIG);

  const resetButton = document.createElement("button");
  resetButton.textContent = "Reset";
  resetButton.type = "button";
  resetButton.className = "place-ships__button";
  container.appendChild(resetButton);
  resetButton.addEventListener("click", () => {
    resetPlaceBoard();
  });
}

function getTargetGrids(headX, headY, length, orientation) {
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

function updateShipGrids(shipId, oldNodes, newNodes) {
  oldNodes.forEach((node) => {
    node.classList.remove(shipId);
    node.classList.remove("occupied");
  });
  newNodes.forEach((node) => {
    node.classList.add(shipId);
    node.classList.add("occupied");
  });
}

function renderShipInStaging(shipInput) {
  const stagingEle = document.querySelector(".place-ships__staging");
  const shipContainer = document.createElement("div");

  // set ship styles
  shipContainer.className = "place-ships__ship-container grid-column";
  shipContainer.setAttribute("draggable", "true");
  shipContainer.setAttribute("id", shipInput.id);
  shipContainer.setAttribute("data-orientation", "y");
  shipContainer.setAttribute("data-length", shipInput.shipLength);
  stagingEle.appendChild(shipContainer);

  // event listeners
  shipContainer.addEventListener("dragstart", (e) => {
    e.dataTransfer.dropEffect = "move";
    e.dataTransfer.effectAllowed = "move";
    const data = {
      id: shipInput.id,
      dragoffset: e.target.dataset.dragoffset,
      orientation: e.target.dataset.orientation,
      length: shipInput.shipLength,
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
  for (let i = 0; i < shipInput.shipLength; i++) {
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

  if (nextShip) renderShipInStaging(nextShip);
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
        const oldGrids = document.querySelectorAll(`.${shipId}`);
        updateShipGrids(shipId, oldGrids, targetGrids);

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
    const nextPlayerName = GAME.getOpponentsName();

    GAME.placeShips(ships);

    if (GAME.isInputComplete(SHIPS_CONFIG)) {
      renderSelectPlayer();
    } else {
      renderPassDeviceSplash(nextPlayerName, renderPlaceShips);
    }
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
