import { clearElement } from "./utility";
import { gameState } from "../state/state";
import { renderPlaceShips } from "./place-ships";

export function renderNameInput(config) {
  const header = document.querySelector("header");
  const isPvp = config == "pvp" ? true : false;
  const titleText = `Enter your name${isPvp ? "s" : ""}:`;
  const inputOneText = isPvp ? "Player One" : "Player";
  const inputTwoText = "Player Two";
  const buttonText = "Continue";
  const computer = {
    name: "Computer",
    isComputer: true,
  };

  clearElement(header);

  const container = document.createElement("form");
  header.appendChild(container);

  const title = document.createElement("h3");
  title.textContent = titleText;
  container.appendChild(title);

  const inputOne = document.createElement("input");
  inputOne.placeholder = inputOneText;
  inputOne.required = "true";
  inputOne.type = "text";
  container.appendChild(inputOne);

  if (config == "pvp") {
    const inputTwo = document.createElement("input");
    inputTwo.placeholder = inputTwoText;
    inputTwo.required = "true";
    inputTwo.type = "text";
    container.appendChild(inputTwo);
  }

  const button = document.createElement("button");
  button.textContent = buttonText;

  button.type = "button";
  button.addEventListener("click", (e) => {
    e.preventDefault();
    if (container.reportValidity()) {
      const inputNodes = document.querySelectorAll("input");

      inputNodes.forEach((ele) => {
        const newPlayerInput = {
          name: ele.value,
          isComputer: false,
        };
        gameState.createPlayer(newPlayerInput);
      });

      if (inputNodes.length == 1) {
        gameState.createPlayer(computer);
      }

      renderPlaceShips();
    }
  });
  container.appendChild(button);
}
