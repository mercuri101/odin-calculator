const display = document.querySelector(".display");
const buttons = document.querySelectorAll(".button");
const clearBtn = document.querySelector(".button.cl");
const backBtn = document.querySelector(".button.back");

let displayContent = "";

let buttonsToShow = Array.from(buttons).filter(button => !(button.classList.contains("special")));
buttonsToShow.forEach(button => button.addEventListener("click", () => populateDisplay(button.getAttribute("data-btn"))));
clearBtn.addEventListener("click", () => clearDisplay());
backBtn.addEventListener("click", () => popFromDisplay());


function populateDisplay(item) {
  displayContent += item;
  display.textContent = displayContent;
}


function clearDisplay() {
  displayContent = "";
  display.textContent = "0";
}


function popFromDisplay() {
  displayContent = displayContent.slice(0, this.length-1);
  display.textContent = displayContent;
}


function add(a, b) {
  return a + b;
}


function subtract(a, b) {
  return a - b;
}


function multiply(a, b) {
  return a * b;
}


function divide(a, b) {
  return a / b;
}


function operate(op, a, b) {
  switch (op) {
    case "+": return add(a, b);
    case "-": return subtract(a, b);
    case "*": return multiply(a, b);
    case "/": return divide(a, b);
  }
}