export default class Ship {
  constructor(shipLength) {
    this.shipLength = shipLength;
    this.status = {};
    this.init();
  }

  init() {
    for (let i = 1; i <= this.shipLength; i++) {
      this.status[i] = false;
    }
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
