const display = document.querySelector(".display");
const buttons = document.querySelectorAll(".button");
const clearBtn = document.querySelector(".button.cl");
const backBtn = document.querySelector(".button.back");
const eqBtn = document.querySelector(".button.eq");

let displayContent = "";

// inputStack is used to keep track of buttons
// that have been clicked.
inputStack = [];

// buttonsToShow is an array containing buttons that
// must display their value when clicked, as opposed to
// speial buttons with unique behaviors (clear, equals, back, etc.).
let buttonsToShow = Array.from(buttons).filter(button => !(button.classList.contains("special")));
buttonsToShow.forEach(button => button.addEventListener("click", () => populateDisplay(button)));

// Implement the behavior of special buttons
clearBtn.addEventListener("click", () => clearDisplay());
backBtn.addEventListener("click", () => popFromDisplay());
eqBtn.addEventListener("click", () => showResult());


function populateDisplay(button) {
  if ((button.textContent === "0") && inputStack.length === 0) {
    return;
  }

  inputStack.push(button);
  updateDisplay();
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


// updateDisplay: A universal helper function that updates
//                displayContent variable and the display
//                depending on the input stack.
function updateDisplay() {
  displayContent = inputStack.map(button => button.getAttribute("data-btn")).join("");
  if (displayContent === "") {
    display.textContent = "0";
  }
  else {
    display.textContent = displayContent;
  }
}


function showResult() {
  let result = evaluateExpression(createExpressionObject(createExpressionArray()));
  display.textContent = result;
  inputStack = [];
}


// The following are simple functions used to
// operate on simple expressions.

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


// The following are the main functions for evaluating the given expression.
// The goal is to create an object representation of the main expression that
// stores its operands and operator. It can contain other similar objects as
// operands (meaning that the expression contains smaller expressions).
// Operator precedence is taken into accound while creating such objects.
// When the object is ready, we evaluate it by operating on it and operating
// on all of its child expressions (if present).

// createExpressionArray: Creates an array of objects, each having type and
//                        value properties. Type can be either of two:
//                        op (operator) or number.
//                        It uses the input stack and its output is basically
//                        an array representation of the expression.
//                        It is an intermediate process for convenience and is
//                        used while creating the main data structure of the
//                        program - the expression object.
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


// createExpressionObject: Creates an expression object from an
//                         expression array.
//                         Expression object is an object representation
//                         of the expression, with properties opn1 (operand-1),
//                         opn2 (operand-2), and op (operator).
//                         Operands of the expression can be other smaller expressions.
function createExpressionObject(expressionArray) {
  let expressionObject = {};
  let len = expressionArray.length;

  // If the expression is simple
  if (len === 3) {
    expressionObject.op = expressionArray[1].value;
    expressionObject.opn1 = expressionArray[0].value;
    expressionObject.opn2 = expressionArray[2].value;
  }

  // If last operator is low-precedence
  else if (expressionArray[len-2].value === "+" || expressionArray[len-2].value === "-") {
    expressionObject.op = expressionArray[len-2].value;
    expressionObject.opn1 = createExpressionObject(expressionArray.slice(0, -2));
    expressionObject.opn2 = expressionArray[len-1].value;
  }

  // If last operator is high-precedence
  else {
    let i = len - 4;
    while (expressionArray[i].value !== "+" && expressionArray[i].value !== "-" && i > 0) {
      i--;
    }

    // If all operators are high-precedence
    if (i === 0) {
      return chainExpression(expressionArray);
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

  return expressionObject;
}


// chainExpression: Used to quickly create an expression object
//                  from a chain of high-precedence operations.
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


// evaluateExpression: Takes an expression object as input and
//                     recursively operates on all of its expressions
//                     (via operate(op, opn1, opn2)).
//                     Returns the result of evaluation as a number.
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