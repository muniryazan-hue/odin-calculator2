const MAX_LENGTH = 12;

const add = (a, b) => a + b;

const subtract = (a, b) => a - b;

const multiply = (a, b) => a * b;

const divide = (a, b) => b === 0 ? 'ERROR' : a / b;

const calculate = (a, b, operator) => {
  let result;

  switch (operator) {
    case '+':
      result = add(a, b);
      break;
    case '–':
      result = subtract(a, b);
      break;
    case '×':
      result = multiply(a, b);
      break;
    case '÷':
      result = divide(a, b);
      break;
    default:
      result = null;
  }

  if (typeof result !== 'number') return result;

  return result;
};

const display = document.querySelector('.display');
const keypad = document.querySelector('.keypad');
const digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
const operators = ['+', '–', '×', '÷'];

let operator = null;
let operand = null;
let waitingForSecondOperand = false;
let zeroDivisionError = false;

function handleInput(val) {
  if (val === 'AC') {
    updateDisplay(0);
    operand = null;
    operator = null;
    waitingForSecondOperand = false;
    zeroDivisionError = false;
    return;
  }

  if (val === '←') {
    if (display.textContent !== '0') {
      const newValue = display.textContent.slice(0, -1);

      display.textContent = newValue === '' || newValue === '-' ? '0' : newValue;
    }
    return;
  }

  if (digits.includes(val) || val === '.') {
    if (waitingForSecondOperand || zeroDivisionError) {
      if (display.textContent === '-0' && val !== '.') {
        updateDisplay('-' + val);
      } else if (display.textContent === '-0' && val === '.') {
        updateDisplay('-0.');
      } else {
        updateDisplay(val === '.' ? '0.' : val);
      }

      waitingForSecondOperand = false;
      zeroDivisionError = false;
      return;
    }

    if (val === '.' && display.textContent.includes('.')) return;

    if (display.textContent.length >= MAX_LENGTH) return;

    if ((display.textContent === '0' || display.textContent === '-0') && val !== '.') {
      updateDisplay(display.textContent === '-0' ? `-${val}` : val);
    } else {
      updateDisplay(display.textContent + val);
    }

    return;
  }

  if (val === '+/–') {
    if (zeroDivisionError) return;

    const currentDisplay = display.textContent;

    if (waitingForSecondOperand) {
      if (currentDisplay === '-0') {
        updateDisplay(0);
      } else {
        updateDisplay('-0');
      }
      return;
    }

    if (currentDisplay === '0') {
      updateDisplay('-0');
    } else if (currentDisplay === '-0') {
      updateDisplay('0');
    } else {
      updateDisplay(Number(display.textContent) * -1);

      if (operator === null) {
        operand = Number(display.textContent);
      }
    }
    return;
  }

  if (operators.includes(val)) {
    if (zeroDivisionError) {
      updateDisplay(0);
      operand = null;
      operator = null;
      zeroDivisionError = false;
      return;
    }

    if (operator && !waitingForSecondOperand) {
      const result = calculate(operand, Number(display.textContent), operator);
      updateDisplay(result);

      if (typeof result === 'string') {
        operand = null;
        operator = null;
        zeroDivisionError = true;
        return;
      }

      operand = result;
    } else {
      operand = Number(display.textContent);
    }

    operator = val;
    waitingForSecondOperand = true;

    return;
  }

  if (val === '=') {
    if (operator === null || waitingForSecondOperand) return;

    const result = calculate(operand, Number(display.textContent), operator);

    updateDisplay(result);

    if (typeof result === 'string') {
      operand = null;
      operator = null;
      zeroDivisionError = true;
      return;
    }

    operand = result;
    operator = null;
    waitingForSecondOperand = true;
  }
}

function formatResult(num) {
  if (typeof num !== 'number') return num;

  if (Math.abs(num) > 10 ** MAX_LENGTH) {
    return num.toExponential(5);
  }

  return parseFloat(num.toPrecision(MAX_LENGTH)).toString().slice(0, MAX_LENGTH);
}

function updateDisplay(value) {
  if (typeof value === 'number') {
    display.textContent = formatResult(value);
  } else {
    display.textContent = value.toString().slice(0, MAX_LENGTH);
  }
}

function highlightButton(val) {
  const buttons = document.querySelectorAll('button');

  const btn = Array.from(buttons).find(b => b.textContent === val);

  if (btn) {
    btn.classList.add('pressed');

    setTimeout(() => {
      btn.classList.remove('pressed');
    }, 100);
  }
}

keypad.addEventListener('click', (e) => {
  if (e.target.tagName !== 'BUTTON') return;
  handleInput(e.target.textContent);
});


window.addEventListener('keydown', (e) => {
  let key = e.key;

  if (key === '/') key = '÷';
  if (key === '*') key = '×';
  if (key === '-') key = '–';
  if (key === 'Enter') key = '=';
  if (key === 'Escape') key = 'AC';
  if (key === 'Backspace') key = '←';

  highlightButton(key);

  handleInput(key);
});