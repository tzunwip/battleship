import Gameboard from "./gameboard";

export default class Game {
  #players = [];
  #activePlayer = 0;
  #hasStarted = false;

  createPlayer(newPlayerInput) {
    if (this.#players.length < 2) {
      this.#players.push(new Gameboard(newPlayerInput));
    }
  }

  placeShips(shipsInput) {
    const activeBoard = this.#players[this.#activePlayer];

    shipsInput.forEach((newShipInput) => {
      activeBoard.placeShip(newShipInput);
    });

    this.#advanceTurn();

    return activeBoard;
  }

  #advanceTurn() {
    if (this.#activePlayer) {
      this.#activePlayer = 0;
    } else {
      this.#activePlayer = 1;
    }
  }

  getOpponent() {
    if (this.#activePlayer) {
      return this.#players[0];
    } else {
      return this.#players[1];
    }
  }

  getOpponentsBoard() {
    return this.getOpponent().getPublicBoard();
  }

  getMyBoard() {
    return this.#players[this.#activePlayer].boardDatabase;
  }

  startGame(firstMover) {
    if (!this.#hasStarted) {
      this.#hasStarted = 1;
      this.#activePlayer = firstMover;

      const renderInput = {
        me: this.getMyBoard(),
        opponent: this.getOpponentsBoard(),
      };
      // render board w/ renderInput
    }
  }

  makeAttack(attackInputs) {
    const coordinate = attackInputs.coordinate;
    const opponentPlayer = this.getOpponent();
    const attackResult = opponentPlayer.receiveAttack(coordinate);
    const hasOpponentLost = opponentPlayer.areAllShipsSunk();

    // check if attack valid
    if (!attackResult) {
      return;
    }

    // check winning condition
    if (hasOpponentLost) {
      return `${this.#players[this.#activePlayer].playerName} has won`;
    }

    this.#advanceTurn();

    if (opponentPlayer.isComputer) {
      // execute computer mask & delayed computer attack
    } else {
      // render mask for next human player
      return attackResult;
    }
  }

  resetGame() {
    this.#players = [];
    this.#activePlayer = 0;
    this.#hasStarted = false;
  }
}
