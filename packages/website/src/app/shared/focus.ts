export function resetFocus() {
  // When the currently focused element is removed from the DOM,
  // the browser will reset the focus of the page.
  const input = document.createElement('input');
  document.body.appendChild(input);
  input.focus();
  document.body.removeChild(input);
}
