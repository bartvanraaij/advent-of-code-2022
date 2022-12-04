const fs = require('fs');
const rawData = fs.readFileSync('input.txt', 'utf8');

const elfPairs = rawData.split("\n").map(str => str.split(','));

const getAssignment = (str) => {
  const [low, high] = str.split('-').map(str => parseInt(str, 10));
  return {low,high};
};

// Part 1
const assignmentsFullyOverlap = (a, b) => {
  return (a.low >= b.low && a.high <= b.high) ||
    (b.low >= a.low && b.high <= a.high);
};

let overlappingCount1 = 0;
for(let [elf1, elf2] of elfPairs) {
  const elf1Assignment = getAssignment(elf1);
  const elf2Assignment = getAssignment(elf2);
  if(assignmentsFullyOverlap(elf1Assignment, elf2Assignment)) {
    overlappingCount1++;
  }
}
console.log(overlappingCount1);

// Part 2
const assignmentsOverlap = (a, b) => {
  return (a.high <= b.high && a.high >= b.low) ||
    (a.low >= b.low && a.low <= b.high) ||
    (b.high <= a.high && b.high >= a.low) ||
    (b.low >= a.low && b.low <= a.high);
}

let overlappingCount2 = 0;
for(let [elf1, elf2] of elfPairs) {
  const elf1Assignment = getAssignment(elf1);
  const elf2Assignment = getAssignment(elf2);
  if(assignmentsOverlap(elf1Assignment, elf2Assignment)) {
    overlappingCount2++;
  }
}
console.log(overlappingCount2);


