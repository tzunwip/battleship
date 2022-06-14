import { GAME } from "../state/state";
import { renderGameDisplay } from "./game-display";
import { getEmptyMainElement, getRandomBinary } from "./utility";

export function renderSelectPlayer() {
  const main = getEmptyMainElement();
  const titleText = "Select First Mover:";
  const playerOneName = GAME.getMyName();
  const playerTwoName = GAME.getOpponentsName();
  const randomButtonText = "Random";

  const container = document.createElement("div");
  container.setAttribute("class", "select-player nes-container");
  main.appendChild(container);

  const title = document.createElement("h4");
  title.setAttribute("class", "select-player__title");
  title.textContent = titleText;
  container.appendChild(title);

  const playerOneButton = document.createElement("button");
  playerOneButton.setAttribute("class", "select-player__button nes-btn");
  playerOneButton.type = "button";
  playerOneButton.textContent = playerOneName;
  container.appendChild(playerOneButton);

  const playerTwoButton = document.createElement("button");
  playerTwoButton.setAttribute("class", "select-player__button nes-btn");
  playerTwoButton.type = "button";
  playerTwoButton.textContent = playerTwoName;
  container.appendChild(playerTwoButton);

  const randomButton = document.createElement("button");
  randomButton.setAttribute("class", "select-player__button nes-btn is-warning");
  randomButton.type = "button";
  randomButton.textContent = randomButtonText;
  container.appendChild(randomButton);

  // event listeners
  playerOneButton.addEventListener("click", () => {
    GAME.startGame(0);
    renderGameDisplay();
  });

  playerTwoButton.addEventListener("click", () => {
    GAME.startGame(1);
    renderGameDisplay();
  });

  randomButton.addEventListener("click", () => {
    const randomNumber = getRandomBinary();
    GAME.startGame(randomNumber);
    renderGameDisplay();
  });
}
