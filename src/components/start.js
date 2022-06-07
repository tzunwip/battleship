import { GAME } from "../state/state";
import { clearElement } from "./utility";
import { renderNameInput } from "./name-input";

export default function renderStart() {
  const main = document.querySelector("main");
  const titleText = "Battleships";
  const descText = "Choose game mode:";
  const pvpText = "2 Players";

  clearElement(main);

  const container = document.createElement("div");
  container.className = "start";

  const gameTitle = document.createElement("h1");
  gameTitle.textContent = titleText;
  gameTitle.className = "start__title";
  container.appendChild(gameTitle);

  const gameDesc = document.createElement("h4");
  gameDesc.textContent = descText;
  gameDesc.className = "start__desc";
  container.appendChild(gameDesc);

  const pvpButton = document.createElement("button");
  pvpButton.textContent = pvpText;
  pvpButton.type = "button";
  pvpButton.className = "start__button";
  pvpButton.addEventListener("click", () => {
    clearElement(main);
    GAME.resetGame();
    renderNameInput("pvp");
  });

  container.appendChild(pvpButton);

  main.appendChild(container);
}
