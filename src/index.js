import ReactDOM from 'react-dom/client';
import React, { useState, useEffect } from 'react';

import './index.css';


function ButtonCalc({ value, handleClick, row }) {
  return (
    <button 
      onClick={() => handleClick({value})} 
      className={`flex-1 text-xl ${value === row[row.length - 1] ? '' : 'mr-1'} font-bold ${value === '=' ? 'bg-blue-500 dark:bg-blue-700' : 'bg-gray-200 dark:bg-gray-800'} dark:text-white`}
    >
      {value}
    </button>
  );
}
function ButtonGroupCalc({ handleClick }) {
  const values = [['%', 'CE', 'C', '⌫'],
                  ['1/x', '√','^', '/'],
                  ['7', '8', '9', '*'], 
                  ['4', '5', '6', '-'], 
                  ['1', '2', '3', '+'], 
                  ['+/-', '0', '.', '=',]];
  return (
    <div className="flex flex-col flex-1">
      {values.map((row, index) => (
        <div key={index} className='mt-2 flex flex-row flex-1'>
          {row.map(value => (
            <ButtonCalc 
              key={value} 
              value={value}
              row={row}
              handleClick={handleClick}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

  
function DisplayScreen({ display, label }) {
  return (
    <div className='relative w-full text-sm'>
      <input 
        value={display} 
        type='text' 
        readOnly 
        className='text-right w-full h-full text-xl pt-8 pr-3 pb-1 pl-0 dark:bg-gray-800 dark:text-white' 
        id='display-input'
      />
      <label 
        htmlFor='display-input' 
        className={`absolute top-0 right-0 pr-3 py-1 transition-all duration-200 ease-in-out text-sm text-gray-700 dark:text-gray-300`}
      >
        {label}
      </label>
    </div>
  );
}


export default function Calculator() {
  const [dark, setDark] = useState(false);
  const [display, setDisplay] = useState('');
  const [operator, setOperator] = useState(null);
  const [firstValue, setFirstValue] = useState(null);
  const [label, setLabel] = useState('');
  const [isNewInput, setIsNewInput] = useState(true);
  const darkModeHandler = () => {
    setDark(!dark);
    document.body.classList.toggle("dark");
  }

  function toFixedNecessary(value, n){
    return +parseFloat(value).toFixed(n);
  }
  
  function handleClick({value}) {
    function handleOperator({operator, firstValue, setDisplay, setFirstValue, setLabel, value}) {
        const secondValue = parseFloat(display);
        let result;
        switch (operator) {
          case '+':
            result = firstValue + secondValue;
            break;
          case '-':
            result = firstValue - secondValue;
            break;
          case '*':
            result = firstValue * secondValue;
            break;
          case '/':
            result = toFixedNecessary((firstValue / secondValue), 12);
            break;
          case '^':
            result = toFixedNecessary(Math.pow(firstValue, secondValue),12);
            break;
            
          default:
            break;
        }
        const label = toFixedNecessary(firstValue, 2) + " " + operator + " " + toFixedNecessary(secondValue, 2) + " = " + String(result);
        setLabel(value !== '=' ? result + " " + value : label);
        setFirstValue(result);
        setDisplay(String(result));
        setIsNewInput(true);
    };
    function clearDisplayifNewInput() {
      if (isNewInput) {
        setDisplay('');
        return true
      }
      return false
    }
    const basicOperators = ['+', '-', '*', '/', '^'];
    const specialOperators = ['C', '⌫', '+/-', '.', 'CE', '√', '%', '1/x'];
    if (specialOperators.includes(value)) {
      switch (value) {
        case 'C':
          setDisplay('');
          setOperator(null);
          setFirstValue(null);
          setLabel('');
          break;
        case 'CE':
          setDisplay('');
          break;
        case '⌫':
          if (!clearDisplayifNewInput()) {
            setDisplay(prevDisplay => prevDisplay.slice(0, -1));
          }
          break;
        case '+/-':
          setDisplay(prevDisplay => String(-parseFloat(prevDisplay)));      
          break;
        case '.':
          if (!display.includes('.') && !isNewInput) {
            setDisplay(prevDisplay => prevDisplay + '.');
          }
          break;
        case '√':
          if (parseFloat(display) >= 0) {
            setDisplay(prevDisplay => String(toFixedNecessary(Math.sqrt(prevDisplay), 12)));
          }
          break;
        case '%':
          if (parseFloat(display) >= 0) {
            setDisplay(prevDisplay => String(toFixedNecessary(prevDisplay / 100, 12)));
          }
          break;
        case '1/x':
          if (parseFloat(display) !== 0 && display) {
            setDisplay(prevDisplay => String(toFixedNecessary(1 / prevDisplay, 12)));
          }
          break;
        default:
          break;
      }
    } else if (basicOperators.includes(value)) {
      if (operator && !display) {
        setOperator(value);
        setLabel(toFixedNecessary(firstValue, 2) + " " + value);
      } else if (!display) {
        return;
      } else if (!firstValue) {
        setFirstValue(parseFloat(display));
        setOperator(value);
        setDisplay('');
        setLabel(toFixedNecessary(display.replace(/\.$/,''), 2) + " " + value);
      } else {
        setOperator(value);
        handleOperator({operator, firstValue, setDisplay, setOperator, setFirstValue, setLabel, value});
      }
    } else if (value === '=') {
      if (firstValue && operator && display && !isNewInput) {
        handleOperator({operator, firstValue, setDisplay, setOperator, setFirstValue, setLabel, value});
        setFirstValue(null);
      }
    } else {
      setDisplay(prevDisplay => isNewInput ? value : prevDisplay + value);
      setIsNewInput(false);
    }
  }

  useEffect(() => {
    function handleKeyDown(event) {
      const key = event.key;
      let buttonValue;
      switch (key) {
        case '0': case '1': case '2': case '3': case '4':
        case '5': case '6': case '7': case '8': case '9':
        case '+': case '-': case '*': case '/': case '.':
        case '^':
          buttonValue = key;
          break;
        case 'Enter':
          buttonValue = '=';
          break;
        case 'Escape':
          buttonValue = 'C';
          break;
        case 'Backspace':
          buttonValue = '⌫';
          break;
        default:
          return;
      }
      handleClick({value: buttonValue});
    }
  
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  });

  return (
    <div className='h-screen w-full text-center transition-all duration-200 dark:bg-gray-900 dark:text-white'>
        <div>
          <button onClick={()=> darkModeHandler()}>
            { dark ? 'Light Mode' : 'Dark Mode' }
          </button>
        </div>
        <div className='flex justify-center'>
          <div className='flex flex-col mt-4 h-[500px] w-[400px]'>
            <div>
              <h1 className='text-4xl sm:text-5xl text-center '>Calculator</h1>
            </div>
            <DisplayScreen display={display} label={label}/>
            <ButtonGroupCalc 
              handleClick={handleClick}
            />
          </div>
        </div>    
    </div>


  );
}

const root = ReactDOM.createRoot(
  document.getElementById('root')
);
root.render(<Calculator />);
