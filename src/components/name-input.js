import { getEmptyMainElement } from "./utility";
import { GAME } from "../state/state";
import { renderPlaceShips } from "./place-ships";

export function renderNameInput() {
  const main = getEmptyMainElement();
  const isPvp = GAME.config.mode == "pvp" ? true : false;
  const titleText = `Enter your name${isPvp ? "s" : ""}:`;
  const inputOnePlaceholder = isPvp ? "Player One" : "Player";
  const inputTwoPlaceholder = "Player Two";
  const buttonText = "Continue";
  const computerInput = {
    name: "Computer",
    isComputer: true,
  };

  const form = document.createElement("form");
  form.className = "name-input nes-container";
  main.appendChild(form);

  const title = document.createElement("h4");
  title.textContent = titleText;
  title.className = "name-input__title";
  form.appendChild(title);

  renderInputFields(form, 0, inputOnePlaceholder);

  if (isPvp) {
    renderInputFields(form, 1, inputTwoPlaceholder);
  }

  const button = document.createElement("button");
  button.textContent = buttonText;
  button.type = "submit";
  button.className = "name-input__button nes-btn is-success";
  form.appendChild(button);

  // add event listener submit
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const inputElements = e.target.elements;

    [0, 1].forEach((index) => {
      const newPlayerInput = inputElements[`name${index}`]
        ? {
            name: inputElements[`name${index}`].value,
            isComputer: inputElements[`auto${index}`].checked,
          }
        : { name: "Computer", isComputer: true };

      GAME.createPlayer(newPlayerInput);
    });

    renderPlaceShips();
  });
}

function renderInputFields(parent, index, placeholder) {
  const fragment = document.createDocumentFragment();

  const nameInput = document.createElement("input");
  nameInput.name = `name${index}`;
  nameInput.placeholder = placeholder;
  nameInput.required = "true";
  nameInput.type = "text";
  nameInput.autocomplete = "off";
  nameInput.className = "name-input__text-input nes-input";
  fragment.appendChild(nameInput);

  const autoLabel = document.createElement("label");
  autoLabel.className = "name-input__auto-label";
  fragment.appendChild(autoLabel);

  const autoCheckbox = document.createElement("input");
  autoCheckbox.name = `auto${index}`;
  autoCheckbox.type = "checkbox";
  autoCheckbox.className = "nes-checkbox";
  autoLabel.appendChild(autoCheckbox);

  const autoSpan = document.createElement("span");
  autoSpan.textContent = "Auto";
  autoLabel.appendChild(autoSpan);

  parent.appendChild(fragment);
}
