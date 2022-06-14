import Computer from "./computer";
import Gameboard from "./gameboard";
import { renderComputerAttack } from "../components/game-display";

export default class Game {
  players = [];
  activePlayer = 0;
  hasStarted = false;
  computer = {};
  config = { mode: "" };

  createPlayer(newPlayerInput) {
    if (this.players.length >= 2) return;

    if (newPlayerInput.isComputer) {
      this.computer[this.activePlayer] = new Computer(this, this.activePlayer);
    }

    this.players.push(new Gameboard(newPlayerInput));

    this.advanceTurn();
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

  getOpponent(playerId = this.activePlayer) {
    if (playerId == 1) {
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

    if (this.checkAutoMode()) this.config.mode = "auto";

    if (this.players[this.activePlayer].isComputer) {
      this.makeComputerAttack();
    }
  }

  makeComputerAttack() {
    setTimeout(() => {
      const attackResult = this.computer[this.activePlayer].sendAttack();
      renderComputerAttack(attackResult);
    }, 1000);
  }

  makeAttack({ coordinate, receivingPlayerId }) {
    // checks input origintes from opponent board only
    if (receivingPlayerId == this.activePlayer) {
      console.error("invalid playerId");
      return { result: "invalid", reason: "playerId" };
    }

    const opponentPlayer = this.getOpponent();
    const attackResult = opponentPlayer.receiveAttack(coordinate);
    const hasOpponentLost = opponentPlayer.areAllShipsSunk();

    // check if attack valid
    if (!attackResult) {
      console.error("invalid attack");
      return { result: "invalid", reason: "occupied" };
    }

    // check winning condition
    if (attackResult.result == "sunk" && hasOpponentLost) {
      return { result: "won", winningPlayer: this.getMyName(), ship: attackResult.ship };
    }

    this.advanceTurn();

    if (opponentPlayer.isComputer) this.makeComputerAttack();

    return attackResult;
  }

  resetGame() {
    this.players = [];
    this.activePlayer = 0;
    this.hasStarted = false;
  }

  checkAutoMode() {
    return this.players[0].isComputer && this.players[1].isComputer;
  }
}
