import { getRandomBinary, getRandomNumber } from "../components/utility";
import { GRID_SIZE } from "../state/state";

export default class Computer {
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
    const attackCoordinate = this.getAttackCoordinate();
    const coordinate = this.getAttackString(attackCoordinate);
    const attackResult = this.game.makeAttack({ coordinate, playerId: this.playerId });

    if (attackResult?.result !== "invalid") {
      this.recordAttack(attackCoordinate, attackResult);
      this.updateAttackHistory();
      return { ...attackResult, ...attackCoordinate, playerId: this.playerId };
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
      this.attackQueue = this.generateScoutAttackQueue(attackCoordinate, GRID_SIZE);
    }
  }

  recordAttackWithQueue(attackCoordinate, attackResult) {
    if (attackCoordinate.offsetFromPivot % 2 == 0) {
      this.purgeCoordinateFromAttackPattern(attackCoordinate);
    }

    switch (attackResult.result) {
      case "hit":
        const nextAttack = this.generateAttackInDirection(attackCoordinate, GRID_SIZE);
        if (nextAttack) this.attackQueue.unshift(nextAttack);
        break;
      case "sunk":
        this.resetAttackQueue();
        break;
    }
  }

  updateAttackHistory() {
    this.attackHistory = this.game.getPublicBoards()[this.playerId].publicBoard;
  }

  purgeCoordinateFromAttackPattern(attackCoordinate) {
    const index = this.attackPattern.findIndex((obj) => {
      return attackCoordinate.x == obj.x && attackCoordinate.y == obj.y;
    });

    this.attackPattern.splice(index, 1);
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

    return queue;
  }

  generateAttackInDirection({ x, y, direction, offsetFromPivot = 0 }, gridSize) {
    switch (direction) {
      // conditionals to check within bounds && not attacked before
      case "n":
        const n = { x, y: y - 1, direction, offsetFromPivot: (offsetFromPivot += 1) };
        if (n.y >= 0 && !(this.getAttackString(n) in this.attackHistory)) return n;
        break;

      case "s":
        const s = { x, y: y + 1, direction, offsetFromPivot: (offsetFromPivot += 1) };
        if (s.y < gridSize && !(this.getAttackString(s) in this.attackHistory)) return s;
        break;

      case "w":
        const w = { x: x - 1, y, direction, offsetFromPivot: (offsetFromPivot += 1) };
        if (w.x >= 0 && !(this.getAttackString(w) in this.attackHistory)) return w;
        break;

      case "e":
        const e = { x: x + 1, y, direction, offsetFromPivot: (offsetFromPivot += 1) };
        if (e.x < gridSize && !(this.getAttackString(e) in this.attackHistory)) return e;
        break;
    }
  }

  resetAttackQueue() {
    this.attackQueue = [];
  }
}
