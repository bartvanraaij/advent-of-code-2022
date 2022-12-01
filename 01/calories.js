const fs = require('fs');

const rawData = fs.readFileSync('input.txt', 'utf8');
const rawDataPerElf = rawData.split("\n\n");

Array.prototype.sum = function () {
  return [].reduce.call(this, (a, i) => a + i, 0);
}

const sums = rawDataPerElf.map((rawDataStr) => {
  return rawDataStr
    .split("\n")
    .filter((str) => str.length)
    .map((str) => parseInt(str, 10))
    .sum();
}).sort((a, b) => a - b);

const largestSum = sums.at(-1);
console.log(largestSum);

const largestThreeSums = sums.slice(-3);
const largestThreeSumsSum = largestThreeSums.sum();
console.log(largestThreeSumsSum);
