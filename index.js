'use strict';

const calculator = document.querySelector('.calculator');
const calculatorClearBlock = document.getElementById('calculator-clear');
let allHistory = [];
let displayHistory = [];
let tempNumber = '0';

// Обробка подій натискання кнопок та їх обробка
calculator.addEventListener('click', (event) => {
  const target = event.target;
  const isCalculatorAction = target.classList.contains('calculator-actions-col');
  const totalBlock = calculator.querySelector('.calculator-display-total');
  const displayHistoryBlock = calculator.querySelector('.calculator-display-history');

  if (isCalculatorAction) {
    const data = target.dataset.type;

    getOperationType(data);
    totalBlock.innerHTML = tempNumber;
    displayHistoryBlock.innerHTML = renderDisplayHistory(displayHistory);

    renderHistoryPanel();
  }
});

// Різні типи введення та обробка конкретних типів
function getOperationType(data) {
  const operators = ['+', '-', '/', '*'];
  const actions = {
    'float': () => {
      if (tempNumber.indexOf('.') === -1) {
        tempNumber += tempNumber ? '.' : '0.';
      }
    },
    'delete': () => {
      tempNumber = tempNumber.substring(0, tempNumber.length - 1);
      tempNumber = tempNumber ? tempNumber : '0';
    },
    'clear': () => {
      if (calculatorClearBlock.innerText === 'C') {
        calculatorClearBlock.innerText = 'AC';
        displayHistory = [];
        tempNumber = '0';
      } else {
        allHistory = [];
      }
    },
    '%': () => {
      tempNumber = calcPercent();
    },
    '=': () => {
      const historySegment = [];
      displayHistory.push(tempNumber);
      tempNumber = calcTotal();
      historySegment.push(displayHistory);
      historySegment.push(tempNumber);
      allHistory.push(historySegment);
      displayHistory = [];
    },
    'history': () => {
      // Відкриття панелі історії
      historyPanel.classList.add('open');
    },
  };

  if (!isNaN(data)) {
    const maxNumberLength = 14;
    if (tempNumber.length < maxNumberLength) {
      tempNumber = tempNumber === '0' ? data : tempNumber + data;
    }
  }
  if (tempNumber !== '0' || displayHistory.length !== 0) {
    calculatorClearBlock.innerText = 'C';
  }
  if (operators.includes(data)) {
    displayHistory.push(tempNumber, data);
    tempNumber = '0';
  }
  if (actions[data]) {
    actions[data]();
  }
}

// Функція для обчислень
function calcTotal() {
  const calcExample = {
    '*': (a, b) => a * b,
    '/': (a, b) => a / b,
    '+': (a, b) => a + b,
    '-': (a, b) => a - b,
  };

  let intermediateResult = []; // проміжний результат
  let i = 0;

  // Спочатку множення та ділення
  while (i < displayHistory.length) {
    if (['*', '/'].includes(displayHistory[i])) {
      let operator = displayHistory[i];
      let prevNumber = parseFloat(intermediateResult.pop());
      let nextNumber = parseFloat(displayHistory[++i]);
      intermediateResult.push(calcExample[operator](prevNumber, nextNumber));
    } else {
      intermediateResult.push(displayHistory[i]);
    }
    i++;
  }

  let total = parseFloat(intermediateResult[0]);
  i = 1;

  // Потім додавання та віднімання
  while (i < intermediateResult.length) {
    if (['+', '-'].includes(intermediateResult[i])) {
      let operator = intermediateResult[i];
      let nextNumber = parseFloat(intermediateResult[++i]);
      total = calcExample[operator](total, nextNumber);
    }
    i++;
  }

  // Округлення до 6 цифр після крапки
  if (total.toString().includes('.')) {
    total = total.toFixed(6);
  }

  return total + '';
}

// Функція для обрахунку процента
function calcPercent() {
  if (displayHistory.length === 0) {
    tempNumber /= 100;
  } else {
    const lastOperator = displayHistory[displayHistory.length - 1];

    if (lastOperator === '*' || lastOperator === '/') {
      if (tempNumber === '0') {
        tempNumber = displayHistory[displayHistory.length - 2] / 100;
      } else {
        tempNumber /= 100;
      }
    } else if (lastOperator === '+' || lastOperator === '-') {
      if (tempNumber !== '0') {
        tempNumber =
          (parseFloat(tempNumber) *
            parseFloat(displayHistory[displayHistory.length - 2])) /
          100;
      }
    }
  }

  return tempNumber + '';
}

// Функції для рендерингу
function renderDisplayHistory(historyArray) {
  let htmlElements = '';
  const operators = ['+', '-', '/', '*'];
  historyArray.forEach((item) => {
    if (!isNaN(item)) {
      htmlElements += `&nbsp;<span>${item}</span>`;
    } else if (operators.includes(item)) {
      if (item === '*') item = '×';
      else if (item === '/') item = '÷';
      htmlElements += `&nbsp;<strong>${item}</strong>`;
    }
  });

  return htmlElements;
}

function renderHistoryPanel() {
  const historyContent = document.getElementById('history-content');
  let historyPanelHtml = '';

  allHistory.forEach((item) => {
    const example = `
        <div>
            <div class="calculator-display-history">
                ${renderDisplayHistory(item[0])}
            </div>
            <div class="calculator-display-total">${item[1]}</div>
        </div>
        `;
    historyPanelHtml += example;
  });
  historyContent.innerHTML = historyPanelHtml;
}

// Зміна тем калькулятора
const themeIcon = document.querySelector('.calculator-theme img');

themeIcon.addEventListener('click', () => {
  const classList = calculator.classList;
  const isDarkTheme = classList.toggle('calculator-dark');

  themeIcon.src = isDarkTheme ? '/images/sun.svg' : '/images/moon.svg';
});

// Закриття панелі історії
const historyPanel = document.getElementById('history-panel');
const closeHistoryPanel = document.getElementById('close-history-panel');

closeHistoryPanel.addEventListener('click', () => {
  historyPanel.classList.remove('open');
});
