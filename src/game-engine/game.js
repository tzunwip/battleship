import Gameboard from "./gameboard";

export default class Game {
  players = [];
  activePlayer = 0;
  hasStarted = false;

  createPlayer(newPlayerInput) {
    if (this.players.length < 2) {
      this.players.push(new Gameboard(newPlayerInput));
    }
  }

  placeShips(shipsInput) {
    const activeBoard = this.players[this.activePlayer];

    shipsInput.forEach((newShipInput) => {
      activeBoard.placeShip(newShipInput);
    });

    this.advanceTurn();

    return activeBoard;
  }

  advanceTurn() {
    if (this.activePlayer) {
      this.activePlayer = 0;
    } else {
      this.activePlayer = 1;
    }
  }

  getMyName() {
    return this.players[this.activePlayer].playerName;
  }

  getOpponentsName() {
    return this.getOpponent().playerName;
  }

  getOpponent() {
    if (this.activePlayer) {
      return this.players[0];
    } else {
      return this.players[1];
    }
  }

  getPublicBoards() {
    return [this.players[0].getPublicBoard(), this.players[1].getPublicBoard()];
  }

  getMyBoard() {
    return this.players[this.activePlayer].boardDatabase;
  }

  getActivePlayerId() {
    return this.activePlayer;
  }

  isInputComplete(requiredShips) {
    const arePlayerBoardsPopulated = this.players.every((player) => {
      return requiredShips.every((ship) => {
        return ship.id in player.shipsDatabase;
      });
    });

    return arePlayerBoardsPopulated;
  }

  startGame(firstMover) {
    if (!this.hasStarted) {
      this.hasStarted = 1;
      this.activePlayer = firstMover;
    }
  }

  makeAttack({ coordinate, playerId }) {
    // checks input origintes from opponent board only
    if (playerId == this.activePlayer) {
      console.error("invalid playerId");
      return;
    }

    const opponentPlayer = this.getOpponent();
    const attackResult = opponentPlayer.receiveAttack(coordinate);
    const hasOpponentLost = opponentPlayer.areAllShipsSunk();

    // check if attack valid
    if (!attackResult) {
      console.error("invalid attack");
      return;
    }

    // check winning condition
    if (attackResult.result == "sunk" && hasOpponentLost) {
      return { result: "won", winningPlayer: this.getMyName(), ship: attackResult.ship };
    }

    this.advanceTurn();

    return attackResult;
  }

  resetGame() {
    this.players = [];
    this.activePlayer = 0;
    this.hasStarted = false;
  }
}
