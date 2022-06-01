export default class Ship {
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
