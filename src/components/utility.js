export function clearElement(element) {
  while (element.hasChildNodes()) {
    element.removeChild(element.lastChild);
  }
}
