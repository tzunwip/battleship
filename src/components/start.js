import { gameState } from "../state/state";
import { clearElement } from "./utility";
import { renderNameInput } from "./name-input";

export default function renderStart() {
  const header = document.querySelector("header");
  const titleText = "Battleships";
  const descText = "Choose game mode:";
  const pvpText = "2 Players";

  clearElement(header);

  const container = document.createElement("div");

  const gameTitle = document.createElement("h1");
  gameTitle.textContent = titleText;
  container.appendChild(gameTitle);

  const gameDesc = document.createElement("h3");
  gameDesc.textContent = descText;
  container.appendChild(gameDesc);

  const pvpButton = document.createElement("button");
  pvpButton.textContent = pvpText;
  pvpButton.type = "button";
  pvpButton.addEventListener("click", () => {
    gameState.resetGame();
    renderNameInput("pvp");
  });

  container.appendChild(pvpButton);

  header.appendChild(container);
}
