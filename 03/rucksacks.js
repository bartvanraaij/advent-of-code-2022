const fs = require('fs');
const rawData = fs.readFileSync('input.txt', 'utf8');

const rucksacks = rawData.split("\n");

const priorities = '_abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

function splitStringHalfway(input) {
  const halfwayIndex = input.length / 2;
  return [input.slice(0, halfwayIndex), input.slice(halfwayIndex)];
}

// Part 1
let prioritySum = 0;
for(let rucksack of rucksacks) {
  const [compartment1, compartment2] = splitStringHalfway(rucksack).map((str) => str.split(''));
  const doubleItems = [...new Set(compartment2.filter((item) => compartment1.includes(item)))];
  const thisPrioritySum = doubleItems.reduce((acc, currentItem) => {
    const thisItemPrio = priorities.indexOf(currentItem);
    return acc + thisItemPrio;
  }, 0);
  prioritySum += thisPrioritySum;
}
console.log(prioritySum);

// Part 2
function chunkArray(arr, chunkSize) {
  const chunks = [];
  for (let i = 0; i < arr.length; i += chunkSize) {
    const thisChunk = arr.slice(i, i + chunkSize);
    chunks.push(thisChunk);
  }
  return chunks;
}
function arrayIntersection(array) {
  return [...new Set(array.reduce((acc, currentSet) => {
    return acc.filter((item) => currentSet.includes(item));
  }))];
}

const elfGroups = chunkArray(rucksacks, 3);
let prioritySum2 = 0;
for(let elfGroup of elfGroups) {
  const elfGroupItems = elfGroup.map((str) => str.split(''));
  const commonItems = arrayIntersection(elfGroupItems);
  const commonItemPrio = priorities.indexOf(commonItems[0]);
  prioritySum2 += commonItemPrio;
}
console.log(prioritySum2);

