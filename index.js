const calculator = document.querySelector('.calculator');
const calculatorClearBlock = document.getElementById('calculator-clear');
let allHistory = [];
let displayHistory = [];
let tempNumber = "0";
let operationType = "";

// Обробка подій натискання кнопок та їх обробка
calculator.addEventListener('click', (event) => {
    const target = event.target;
    if(target.classList.contains('calculator-actions-col')){
        const data = target.dataset.type;
        const totalBlock = calculator.querySelector('.calculator-display-total');
        const displayHistoryBlock = calculator.querySelector('.calculator-display-history');

        getOperationType(data);
        totalBlock.innerHTML = tempNumber;
        displayHistoryBlock.innerHTML = renderDisplayHistory(displayHistory);

        renderHistoryPanel();
    }
});

// Різні типи введення та обробка конкретних типів
function getOperationType(data)
{
    if(!isNaN(data)){
        operationType = "number";
        if(tempNumber.length <= 13) tempNumber = tempNumber === '0' ? data : tempNumber + data;
    }
    if(tempNumber !== '0' || displayHistory.length !== 0){
        calculatorClearBlock.innerText = "C";
    }
    if(data === 'float'){
        operationType = "number";
        if(!/\./.test(tempNumber)){
            if(tempNumber){
                tempNumber += ".";
            }
            else {
                tempNumber += "0.";
            }
        }
    }
    if(data === 'delete' && operationType === 'number'){
        tempNumber = tempNumber.substring(0, tempNumber.length - 1);
        tempNumber = tempNumber ? tempNumber : "0";
    }
    if(['+', '-', '/', '*'].includes(data) && tempNumber){
        operationType = data;
        displayHistory.push(tempNumber, operationType);
        tempNumber = "0";
    }
    if(data === 'clear'){
        if(calculatorClearBlock.innerText === 'C'){
            calculatorClearBlock.innerText = "AC";
            displayHistory = [];
            tempNumber = "0";
        } else {
            allHistory = [];
        }
    }
    if(data === '%'){
        tempNumber = calcPercent();
    }
    if(data === '='){
        const historySegment = [];
        displayHistory.push(tempNumber);
        tempNumber = calcTotal();
        historySegment.push(displayHistory);
        historySegment.push(tempNumber);
        allHistory.push(historySegment);
        displayHistory = [];
    }
    if(data === 'history'){
        openHistoryPanel();
    }
}

// Функція для обчислень
function calcTotal()
{
    let intermediateResult = []; // проміжний результат
    let i = 0;

    // Спочатку множення та ділення
    while (i < displayHistory.length) {
        if (displayHistory[i] === '*') {
            let prevNumber = parseFloat(intermediateResult.pop());
            let nextNumber = parseFloat(displayHistory[++i]);
            intermediateResult.push(prevNumber * nextNumber);
        } else if (displayHistory[i] === '/') {
            let prevNumber = parseFloat(intermediateResult.pop());
            let nextNumber = parseFloat(displayHistory[++i]);
            intermediateResult.push(prevNumber / nextNumber);
        } else {
            intermediateResult.push(displayHistory[i]);
        }
        i++;
    }

    let total = parseFloat(intermediateResult[0]);
    i = 1;

    // Потім додавання та віднімання
    while (i < intermediateResult.length) {
        if (intermediateResult[i] === '+') {
            total += parseFloat(intermediateResult[++i]);
        } else if (intermediateResult[i] === '-') {
            total -= parseFloat(intermediateResult[++i]);
        }
        i++;
    }

    // Округлення до 6 цифр після коми
    if(/\./.test(total.toString())) total = total.toFixed(6);

    return total + "";
}

// Функція для обрахунку процента
function calcPercent()
{
    if(displayHistory.length === 0){
        tempNumber /= 100;
    } else {
        const lastOperator = displayHistory[displayHistory.length - 1];

        if(lastOperator === '*' || lastOperator === '/'){
            if (tempNumber === '0') {
                tempNumber = displayHistory[displayHistory.length - 2] / 100;
            } else {
                tempNumber /= 100;
            }
        } else if(lastOperator === '+' || lastOperator === '-'){
            if(tempNumber !== '0'){
                tempNumber = parseFloat(tempNumber) * parseFloat(displayHistory[displayHistory.length - 2]) / 100;
            }
        }
    }

    return tempNumber + "";
}

// Функція для відкриття панелі історії
function openHistoryPanel()
{
    historyPanel.classList.add('open');
}

// Функції для рендерингу
function renderDisplayHistory(historyArray)
{
    let htmlElements = "";
    historyArray.forEach((item) => {
        if(!isNaN(item)){
            htmlElements += `&nbsp;<span>${item}</span>`;
        }
        else if(['+', '-', '/', '*'].includes(item)){
            if(item === '*') item = "×";
            else if(item === '/') item = "÷";
            htmlElements += `&nbsp;<strong>${item}</strong>`;
        }
    });

    return htmlElements;
}

function renderHistoryPanel()
{
    const historyContent = document.getElementById('history-content');
    let historyPanelHtml = "";

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
const themeIcon = document.querySelector(".calculator-theme img");

themeIcon.addEventListener("click", () => {
    if (calculator.classList.contains("calculator-dark")) {
        calculator.classList.remove("calculator-dark");
        themeIcon.src = "/images/moon.svg";
    } else {
        calculator.classList.add("calculator-dark");
        themeIcon.src = "/images/sun.svg";
    }
});

// Відкриття/закритя панелі історії
const historyPanel = document.getElementById('history-panel');
const closeHistoryPanel = document.getElementById('close-history-panel');

closeHistoryPanel.addEventListener("click", () => {
    historyPanel.classList.remove('open');
});

