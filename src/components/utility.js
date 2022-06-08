export function getEmptyMainElement() {
  const main = document.querySelector("main");

  clearElement(main);

  return main;
}

export function clearElement(element) {
  while (element.hasChildNodes()) {
    element.removeChild(element.lastChild);
  }
}

export function renderPassDeviceSplash(nextPlayerName, callbackFn) {
  const main = getEmptyMainElement();
  const textDescOne = `Pass device to ${nextPlayerName}.`;
  const textDescTwo = "Click to continue.";

  const splash = document.createElement("div");
  splash.setAttribute("class", "pass-device");
  main.appendChild(splash);

  const descOne = document.createElement("h4");
  descOne.textContent = textDescOne;
  splash.appendChild(descOne);

  const descTwo = document.createElement("h4");
  descTwo.textContent = textDescTwo;
  splash.appendChild(descTwo);

  splash.addEventListener("click", () => {
    splash.remove();
    callbackFn();
  });
}
