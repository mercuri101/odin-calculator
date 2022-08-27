const display = document.querySelector(".display");
const buttons = document.querySelectorAll(".button");
const clearBtn = document.querySelector(".button.cl");
const backBtn = document.querySelector(".button.back");
const eqBtn = document.querySelector(".button.eq");

let displayContent = "";
inputStack = [];

let buttonsToShow = Array.from(buttons).filter(button => !(button.classList.contains("special")));
buttonsToShow.forEach(button => button.addEventListener("click", () => populateDisplay(button)));
clearBtn.addEventListener("click", () => clearDisplay());
backBtn.addEventListener("click", () => popFromDisplay());
eqBtn.addEventListener("click", () => showResult());


function populateDisplay(item) {
  if ((item.textContent === "0") && inputStack.length === 0) {
    return;
  }

  inputStack.push(item);
  updateDisplay();
}


function showResult() {
  let result = evaluateExpression(createExpressionObject(createExpressionArray()));
  display.textContent = result;
  inputStack = [];
}

function clearDisplay() {
  inputStack = [];
  updateDisplay();
}


function popFromDisplay() {
  if (inputStack.length === 0) {
    return;
  }
  inputStack.pop();
  updateDisplay();
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


function updateDisplay() {
  displayContent = inputStack.map(button => button.getAttribute("data-btn")).join("");
  if (displayContent === "") {
    display.textContent = "0";
  }
  else {
    display.textContent = displayContent;
  }
}


function createExpressionArray() {
  expressionArray = [];

  let i = 0;
  for (let j = 0; j < inputStack.length; j++) {
    if (inputStack[j].classList.contains("op")) {
      let number = Number(inputStack.slice(i, j).map(btn => btn.getAttribute("data-btn")).join(""));
      expressionArray.push({type: "number", value: number});
      expressionArray.push({type: "op", value: inputStack[j].getAttribute("data-btn")});
      i = j + 1;
    }
  }
  let number = Number(inputStack.slice(i).map(btn => btn.getAttribute("data-btn")).join(""));
  expressionArray.push({type: "number", value: number});

  return expressionArray;
}


function createExpressionObject(expressionArray) {
  let expressionObject = {};
  let len = expressionArray.length;

  // If last operator is low-precedence
  if (expressionArray[len-2].value === "+" || expressionArray[len-2].value === "-") {
    expressionObject.op = expressionArray[len-2].value;
    expressionObject.opn2 = expressionArray[len-1].value;

    if (expressionArray.length === 3) {
      expressionObject.opn1 = expressionArray[0].value;
    }
    else {
      expressionObject.opn1 = createExpressionObject(expressionArray.slice(0, -2));
    }
  }

  // If last operator is high-precedence
  else {
    let i = len - 4;
    while (expressionArray[i].value !== "+" && expressionArray[i].value !== "-") {
      i--;
    }

    expressionObject.op = expressionArray[i].value;
    if (expressionArray.slice(0, i).length === 1) {
      expressionObject.opn1 = expressionArray[0].value;
    }
    else {
      expressionObject.opn1 = createExpressionObject(expressionArray.slice(0, i));
    }

    expressionObject.opn2 = chainExpression(expressionArray.slice(i+1));

  }

  console.log(expressionObject);
  return expressionObject;
}


function chainExpression(expressionArray) {
  let expressionObject = {};
  let len = expressionArray.length;

  if (len === 3) {
    expressionObject.op = expressionArray[1].value;
    expressionObject.opn1 = expressionArray[0].value;
    expressionObject.opn2 = expressionArray[2].value;
  }
  else {
    expressionObject.op = expressionArray[len-2].value;
    expressionObject.opn1 = chainExpression(expressionArray.slice(0, -2));
    expressionObject.opn2 = expressionArray[len-1].value;
  }

  return expressionObject;
}


function evaluateExpression(expressionObject) {
  if (typeof(expressionObject) === "number") {
    return expressionObject;
  }
  else if (typeof(expressionObject.opn1) === "number" && typeof(expressionObject.opn2) === "number") {
    return operate(expressionObject.op, expressionObject.opn1, expressionObject.opn2);
  }
  else {
    return operate(expressionObject.op, evaluateExpression(expressionObject.opn1), evaluateExpression(expressionObject.opn2));
  }
}