const fs = require('fs');
const rawData = fs.readFileSync('input.txt', 'utf8');

Array.prototype.sum = function () {
  return [].reduce.call(this, (a, i) => a + i, 0);
}

let cycles = [];
const program = rawData.split("\n").map((str) => {
  let [instr,num] = str.split(' ');
  return { instr, value: parseInt(num, 10) }
});

for(let line of program) {
  cycles.push(0); // Add 0 for noop and the first iteration of addx
  if(line.instr === 'addx') {
    cycles.push(line.value)
  }
}

// Part 1
let x = 1;
const wantedSignalsStrengthsNums = [20, 60, 100, 140, 180, 220];
let wantedSignalsSum = 0;

for(let i=1; i<=cycles.length; i++) {
  const signalStrength = x*i;
  x = x+cycles[i-1];
  if(wantedSignalsStrengthsNums.includes(i)) {
    wantedSignalsSum += signalStrength;
  }
}
console.log(wantedSignalsSum);


