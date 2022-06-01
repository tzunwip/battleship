import Ship from "./ships";

export default class Gameboard {
  // keys are coordinates, values are {isAttacked: boolean, ship: this.shipsDatabase.name}
  boardDatabase = {};
  // keys are ship name, values are Ship class objects
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

  // shipData {name: '', coordinates: ['x1y1', ...]}
  placeShip(newShipInputs) {
    // catch placement on occupied grids
    if (this.checkPlaceShipValid(newShipInputs) == false) {
      return "invalid placement";
    }

    let newShip = new Ship(newShipInputs);

    // adds newShip to shipsDatabase
    this.shipsDatabase[newShipInputs.name] = newShip;

    // adds ship name to shipNamesList array
    this.shipNamesList.push(newShipInputs.name);

    // adds newShip reference to
    newShipInputs.coordinates.forEach((position) => {
      this.boardDatabase[position] = { ship: this.shipsDatabase[newShipInputs.name] };
    });
  }

  receiveAttack(position) {
    // grid not attacked && no ship
    if (position in this.boardDatabase == false) {
      this.boardDatabase[position] = { isAttacked: true };
      return "miss";
    }

    let grid = this.boardDatabase[position];

    // grid not attacked && ship
    if ("isAttacked" in grid == false && "ship" in grid == true) {
      grid.isAttacked = true;
      grid.ship.hit(position);
      return "hit";
    }
    // grid attacked already, with ship or no ship
    if (grid.isAttacked == true) {
      return console.error("error receiveAttack(), grid has been attacked already");
    }
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
      if ("isAttacked" in boardDatabase[key]) {
        return { ...acc, [key]: { isAttacked: true, hasShip: "ship" in boardDatabase[key] } };
      }
      return acc;
    }, {});

    return publicBoard;
  }
}
