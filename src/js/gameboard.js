import Ship from "./ships";

export default class Gameboard {
  constructor() {
    // keys are coordinates, values are {isAttacked: boolean, ship: this.shipsDatabase.name}
    this.boardDatabase = {};
    // keys are ship name, values are Ship class objects
    this.shipsDatabase = {};
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
      return "error";
    }
  }
}
