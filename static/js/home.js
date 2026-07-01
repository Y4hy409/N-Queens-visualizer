const nInput = document.querySelector("#n");
const nValue = document.querySelector("#nValue");
const boardLabel = document.querySelector("#boardLabel");
const adjustButtons = document.querySelectorAll("[data-action]");

function updateBoardSize(nextValue) {
  nInput.value = String(nextValue);
  nValue.textContent = String(nextValue);
  boardLabel.textContent = `${nextValue} × ${nextValue} board`;
}

adjustButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const current = Number(nInput.value);
    const delta = button.dataset.action === "increment" ? 1 : -1;
    const next = Math.max(4, Math.min(10, current + delta));
    updateBoardSize(next);
  });
});
