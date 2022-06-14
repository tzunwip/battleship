import { getEmptyMainElement } from "./utility";
import { GAME } from "../state/state";
import { renderPlaceShips } from "./place-ships";

export function renderNameInput() {
  const main = getEmptyMainElement();
  const isPvp = GAME.config.mode == "pvp" ? true : false;
  const titleText = `Enter your name${isPvp ? "s" : ""}:`;
  const inputOneText = isPvp ? "Player One" : "Player";
  const inputTwoText = "Player Two";
  const buttonText = "Continue";
  const computerInput = {
    name: "Computer",
    isComputer: true,
  };

  const container = document.createElement("form");
  container.className = "name-input";
  main.appendChild(container);

  const title = document.createElement("h4");
  title.textContent = titleText;
  title.className = "name-input__title";
  container.appendChild(title);

  const inputOne = document.createElement("input");
  inputOne.placeholder = inputOneText;
  inputOne.required = "true";
  inputOne.type = "text";
  inputOne.className = "name-input__text-input";
  container.appendChild(inputOne);

  if (isPvp) {
    const inputTwo = document.createElement("input");
    inputTwo.placeholder = inputTwoText;
    inputTwo.required = "true";
    inputTwo.type = "text";
    inputTwo.className = "name-input__text-input";
    container.appendChild(inputTwo);
  }

  const button = document.createElement("button");
  button.textContent = buttonText;
  button.type = "submit";
  button.className = "name-input__button";
  button.addEventListener("click", (e) => {
    e.preventDefault();
    if (container.reportValidity()) {
      const inputNodes = document.querySelectorAll("input");
      const gameMode = GAME.config.mode;

      inputNodes.forEach((ele) => {
        const newPlayerInput = {
          name: ele.value,
          isComputer: gameMode == "auto" ? true : false,
        };
        GAME.createPlayer(newPlayerInput);
      });

      if (inputNodes.length == 1) {
        GAME.createPlayer(computerInput);
      }

      renderPlaceShips();
    }
  });
  container.appendChild(button);
}
