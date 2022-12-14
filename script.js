const display = document.querySelector(".display");
const buttons = document.querySelectorAll(".button");
const clearBtn = document.querySelector(".button.cl");
const backBtn = document.querySelector(".button.back");
const eqBtn = document.querySelector(".button.eq");

let displayContent = "";

// inputStack is used to keep track of buttons
// that have been clicked.
inputStack = [];
let resultShown = false;

// buttonsToShow is an array containing buttons that
// must display their value when clicked, as opposed to
// speial buttons with unique behaviors (clear, equals, back, etc.).
let buttonsToShow = Array.from(buttons).filter(button => !(button.classList.contains("special")));
buttonsToShow.forEach(button => button.addEventListener("click", () => populateDisplay(button)));

// Implement the behavior of special buttons
clearBtn.addEventListener("click", () => clearDisplay());
backBtn.addEventListener("click", () => popFromDisplay());
eqBtn.addEventListener("click", () => showResult());


// populateDisplay: Validates the input and
//                  updates the input stack accordingly.
function populateDisplay(button) {

  // If the display is full, do nothing
  if (inputStack.length === 24) {
    return;
  }

  // Validate input while previous result is being displayed
  if (resultShown === true) {
    // If numbers are entered, withdraw the result
    if (!(button.classList.contains("op"))) {
      while (inputStack.length > 0) {
        inputStack.pop();
      }
    }
    resultShown = false;
  }

  // Validate entering "0"
  if (button.getAttribute("data-btn") === "0") {
    // If clicked first, do nothing
    if (inputStack.length === 0) {
      return;
    }
    // If reduntant leading zero, do nothing
    if (inputStack[inputStack.length-1].getAttribute("data-btn") === "0" &&
        !(inputStack[inputStack.length-2].classList.contains("digit")) &&
        !(inputStack[inputStack.length-2].classList.contains("misc"))){
      return;
    }
  }

  // Validate entering "."
  if (button.getAttribute("data-btn") === ".") {
    // If clicked twice within a single number, do nothing
    let dotPresent = false;
    for (let i = inputStack.length-1; i >= 0 && !(inputStack[i].classList.contains("op")); i--) {
      if (inputStack[i].getAttribute("data-btn") === ".") {
        dotPresent = true;
      }
    }
    if (dotPresent) {
      return;
    }
    // If no leading zeros, add a leading zero
    if ((inputStack.length === 0 || !(inputStack[inputStack.length-1].classList.contains("digit")))) {
      inputStack.push(buttonsToShow.find(button => button.getAttribute("data-btn") === "0"));
    }
  }

  // Validate entering operators
  if (button.classList.contains("op")) {
    // If clicked first, do nothing
    if ((inputStack.length === 0)) {
      return;
    }
    // If clicked twice in a row, replace the previous one
    if (inputStack[inputStack.length-1].classList.contains("op")) {
      inputStack.pop();
    }
    // If clicked after a trailing dot, add a trailing zero
    if (inputStack[inputStack.length-1].getAttribute("data-btn") === ".") {
      inputStack.push(buttonsToShow.find(button => button.getAttribute("data-btn") === "0"));
    }
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
  let expressionArray = createExpressionArray();

  // If there is nothing to evaluate, return
  if (expressionArray.length === 1) {
    return;
  }

  let result = evaluateExpression(createExpressionObject(expressionArray));

  // Check for division by zero
  if (result === null) {
    inputStack = [];
    display.textContent = "ERROR";
    return;
  }

  // The following registers the result in the input stack, as if
  // it was entered within a new expression, to enable using it in
  // new expressions.
  inputStack = [];
  let resultString = result.toString();
  resultString.split("").forEach(char => inputStack.push(
                                         buttonsToShow.find(
                                         button => button.getAttribute("data-btn") === char)));
  resultShown = true;
  updateDisplay();
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
  if (a === null || b === null) {
    return null;
  }

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
//                        It uses the input stack, and its output is basically
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
//                         Operands of the expression can be other smaller expressions
//                         in the form of objects.
function createExpressionObject(expressionArray) {
  let expressionObject = {};
  let len = expressionArray.length;

  // If the expression is simple
  if (len === 3) {
    expressionObject.op = expressionArray[1].value;
    expressionObject.opn1 = expressionArray[0].value;
    expressionObject.opn2 = expressionArray[2].value;
  }

  // If the expression is not simple, and the last operator is low-precedence
  else if (expressionArray[len-2].value === "+" || expressionArray[len-2].value === "-") {
    expressionObject.op = expressionArray[len-2].value;
    expressionObject.opn1 = createExpressionObject(expressionArray.slice(0, -2));
    expressionObject.opn2 = expressionArray[len-1].value;
  }

  // If the expression is not simple, and the last operator is high-precedence
  else {
    let i = len - 4;
    // Search for the last low-precedence operator
    while (expressionArray[i].value !== "+" && expressionArray[i].value !== "-" && i > 0) {
      i--;
    }

    // If all operators are high-precedence, chain the expression (see below)
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
//                  Opn2 is always the last number in the expression, while
//                  opn1 is assigned everything else as a subexpression.
//                  It's executed recursively until opn1 is assigned a
//                  single number.
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
//                     recursively operates on all of its subexpressions
//                     (via operate(op, opn1, opn2), see above).
//                     Returns the result of evaluation as a number.
function evaluateExpression(expressionObject) {
  if (typeof(expressionObject) === "number") {
    return expressionObject;
  }
  else if ((expressionObject.opn2 === 0 && expressionObject.op === "/") ||
           (expressionObject.opn1 === null || expressionObject.opn2 === null)) {
    return null;
  }
  else {
    return operate(expressionObject.op, evaluateExpression(expressionObject.opn1), evaluateExpression(expressionObject.opn2));
  }
}