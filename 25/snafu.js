const fs = require('fs');
const sampleData = fs.readFileSync('sample.txt', 'utf8');
const inputData = fs.readFileSync('input.txt', 'utf8');

const parseInput = (inputData) => {
  return inputData.split('\n');
}

const snafuToDecimal = (input) => {
  // Split into characters, big endian
  const charsBigEndian = [...input.split('').reverse()];
  let decimal = 0;
  for(let i in charsBigEndian) {
    const char = charsBigEndian[i];
    let multiplier =  5**i;
    let num;
    if(char === '-') num = -1;
    else if(char === '=') num = -2;
    else num = parseInt(char, 10);
    decimal += (num * multiplier);
  }
  return decimal;
}


const decimalToSnafu = (input) => {
  const base5 = input.toString(5);
  const charsBigEndian = [...base5.split('').reverse()].map(str => parseInt(str, 10));
  let snafuChars = [];
  // Carry over everything > 2
  let carryOver = 0;
  for(let i in charsBigEndian) {
    let num = charsBigEndian[i] + carryOver;
    // if(char.toInt(10) >
    if(num === 5) {
      snafuChars.push('0');
      carryOver = 1;
    }
    else if(num === 4) {
      snafuChars.push('-');
      carryOver = 1;
    }
    else if(num === 3) {
      snafuChars.push('=');
      carryOver = 1;
    }
    else {
      snafuChars.push(num.toString(10));
      carryOver = 0
    }
  }
  if(carryOver) {
    snafuChars.push(carryOver.toString(10));
  }

  const snafu = [...snafuChars.reverse()].join('');
  return snafu;
}

const getSnafuSumFromInput = (inputData) => {
  const snafuLines = parseInput(inputData);
  const decimal = snafuLines.map(snafuToDecimal);
  const decimalSum = decimal.reduce((acc, curr) => acc+curr);
  const snafuSum = decimalToSnafu(decimalSum);
  return snafuSum;
}

const snafuFuelAmount = getSnafuSumFromInput(inputData);
console.log(snafuFuelAmount);
