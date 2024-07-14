import ReactDOM from 'react-dom/client';
import React, { useState, useEffect } from 'react';

import { Container, Button, ButtonGroup, Form, FloatingLabel } from 'react-bootstrap';

import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';


function ButtonCalc({ value, handleClick, row }) {
  return (
    <Button 
      variant={value === '=' ? 'primary' : 'light'} 
      onClick={() => handleClick({value})} 
      className={`${value === row[row.length - 1] ? '' : 'me-1'} button-calc fw-bold w-25`}
    >
      {value}
    </Button>
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
    <div className="d-flex flex-column flex-grow-1 w-100">
      {values.map((row, index) => (
        <ButtonGroup key={index} className='mt-2 flex-grow-1'>
          {row.map(value => (
            <ButtonCalc 
              key={value} 
              value={value}
              row={row}
              handleClick={handleClick}
            />
          ))}
        </ButtonGroup>
      ))}
    </div>
  );
}
  
function DisplayScreen({ display, label }) {
  return (
    <FloatingLabel controlId="floatingInput" label={label} className='w-100'>
      <Form.Control value={display} type='text' readOnly className='text-end w-100 fs-2' />
    </FloatingLabel>
  );
}

export default function Calculator() {
  const [display, setDisplay] = useState('');
  const [operator, setOperator] = useState(null);
  const [firstValue, setFirstValue] = useState(null);
  const [label, setLabel] = useState('');
  const [isNewInput, setIsNewInput] = useState(true);

  function toFixedNecessary(value, n){
    return +parseFloat(value).toFixed(n);
  }
  
  function handleClick({value}) {
    function handleOperator({operator, firstValue, setDisplay, setFirstValue, setLabel, value}) {
      return () => {
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
    }
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
      if (!display) {
        return;
      } else if (!firstValue) {
        setFirstValue(parseFloat(display));
        setOperator(value);
        setDisplay('');
        setLabel(toFixedNecessary(display.replace(/\.$/,''), 2) + " " + value);
      } else if ((operator && !display) || isNewInput) {
        setOperator(value);
        setLabel(toFixedNecessary(firstValue, 2) + " " + value);
      } else {
        setOperator(value);
        handleOperator({operator, firstValue, setDisplay, setOperator, setFirstValue, setLabel, value})();
      }
    } else if (value === '=') {
      if (firstValue && operator && display && !isNewInput) {
        handleOperator({operator, firstValue, setDisplay, setOperator, setFirstValue, setLabel, value})();
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
    <Container className='d-flex justify-content-center align-items-center mt-1  '>
      <div className='calculator d-flex flex-column flex-nowrap align-items-center justify-content-center'>
        <h1>Calculator</h1>
        <DisplayScreen display={display} label={label}/>
        <ButtonGroupCalc 
          handleClick={handleClick}
        />
      </div>
    </Container>
  );
}

const root = ReactDOM.createRoot(
  document.getElementById('root')
);
root.render(<Calculator />);
