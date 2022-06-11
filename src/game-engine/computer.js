import { getRandomBinary, getRandomNumber } from "../components/utility";
import { GRID_SIZE } from "../state/state";

export default class Computer {
  attackPattern;
  attackHistory = {};
  attackQueue = [];

  constructor(playerId) {
    this.playerId = playerId;
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
    return this.attackPattern.splice(randomNumber, 1);
  }

  getAttackString(attackCoordinates) {
    return `x${attackCoordinates.x}y${attackCoordinates.y}`;
  }

  sendAttack(game) {
    if (this.attackQueue.length > 0) {
      const attackCoordinate = this.attackQueue.splice(0, 1);
      const coordinate = getAttackString(attackCoordinate);
      const attackResult = game.makeAttack({ coordinate, playerId: this.playerId });

      this.recordAttackWithQueue(attackCoordinate, attackResult);
    } else {
      const attackCoordinate = this.attackPattern[getRandomNumber(this.attackPattern.length - 1)];
      const coordinate = this.getAttackString(attackCoordinate);
      const attackResult = game.makeAttack({ coordinate, playerId: this.playerId });

      this.recordAttackWithoutQueue(attackCoordinate, attackResult);
    }

    console.log(this.attackHistory);
    console.log(this.attackPattern);
    console.log(this.attackQueue);
  }

  recordAttackWithoutQueue(attackCoordinate, attackResult) {
    switch (attackResult.result) {
      case "miss":
        this.recordAttackHistory(attackCoordinate, "miss");
        break;
      case "hit":
        this.recordAttackHistory(attackCoordinate, "hit");
        this.attackQueue = this.generateScoutAttackQueue(attackCoordinate, GRID_SIZE);
        break;
    }
  }

  recordAttackWithQueue(attackCoordinate, attackResult) {
    switch (attackResult.result) {
      case "miss":
        this.recordAttackHistory(attackCoordinate, "miss");
        break;
      case "hit":
        this.recordAttackHistory(attackCoordinate, "hit");
        const nextAttack = this.generateAttackInDirection(attackCoordinate, GRID_SIZE);
        if (nextAttack) this.attackQueue.unshift(nextAttack);
        break;
      case "sunk":
        this.recordAttackHistory(attackCoordinate, "hit");
        this.resetAttackQueue();
        break;
    }

    if (attackCoordinate.offsetFromPivot % 2 == 0) {
      this.purgeCoordinateFromAttackHistory(attackCoordinate);
    }
  }

  recordAttackHistory(attackCoordinate, result) {
    const attackString = this.getAttackString(attackCoordinate);
    this.attackHistory[attackString] = result;
  }

  purgeCoordinateFromAttackPattern(attackCoordinate) {
    const index = this.attackPattern.findIndex((obj) => {
      return attackCoordinate.x == obj.x && attackCoordinate.y == obj.y;
    });

    this.attackPattern.splice(index, 1);
  }

  generateScoutAttackQueue(pivot, gridSize) {
    const directions = ["n", "s", "w", "e"];

    return directions.map((direction) => {
      return this.generateAttackInDirection({ ...pivot, direction }, gridSize);
    });
  }

  generateAttackInDirection({ x, y, direction, offsetFromPivot = 0 }, gridSize) {
    switch (direction) {
      // conditionals to check within bounds && not attacked before
      case "n":
        const n = { x, y: y - 1, direction, offsetFromPivot: offsetFromPivot++ };
        if (n.y > 0 && !this.getAttackString(n) in this.attackHistory) return n;
        break;

      case "s":
        const s = { x, y: y + 1, direction, offsetFromPivot: offsetFromPivot++ };
        if (s.y < gridSize && !this.getAttackString(s) in this.attackHistory) return s;
        break;

      case "w":
        const w = { x: x - 1, y, direction, offsetFromPivot: offsetFromPivot++ };
        if (w.x > 0 && !this.getAttackString(w) in this.attackHistory) return w;
        break;

      case "e":
        const e = { x: x + 1, y, direction, offsetFromPivot: offsetFromPivot++ };
        if (e.x < gridSize && !this.getAttackString(e) in this.attackHistory) return e;
        break;
    }
  }

  resetAttackQueue() {
    this.attackQueue = [];
  }
}
