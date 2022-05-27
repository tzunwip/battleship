import Ship from "./ships";

export default class Gameboard {
  constructor() {
    // keys are coordinates, values are ship in this.shipsDatabase
    this.boardDatabase = {};
    // keys are ship name, values are Ship class objects
    this.shipsDatabase = {};
  }

  // shipData {name: '', coordinates: ['x1y1', ...]}
  placeShip(newShipInputs) {
    let newShip = new Ship(newShipInputs);

    // adds newShip to shipsDatabase
    this.shipsDatabase[newShipInputs.name] = newShip;

    // adds newShip reference to
    newShipInputs.coordinates.forEach((position) => {
      this.boardDatabase[position] = { ship: this.shipsDatabase[newShipInputs.name] };
    });
  }
}
