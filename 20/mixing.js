const fs = require('fs');
const sampleData = fs.readFileSync('sample.txt', 'utf8');
const inputData = fs.readFileSync('input.txt', 'utf8');

String.prototype.toInt = function () {
  return parseInt(this,10);
}
const toInt = (str) => str.toInt();

let numToId = (pos,num) => `${pos}.${num}`;
let idToNumPos = (id) => id.split('.').map(toInt);
let idToNum = (id) => {
  const [pos,num] = id.split('.').map(toInt);
  return num;
};

const moveItemInList = (list, currIndex, destIndex) => {
  const item = list[currIndex];
  list.splice(currIndex, 1);
  list.splice(destIndex, 0, item);
}

const moveNumInList = (id, list, verbose=false) => {
  const currentIndexOfId = list.findIndex((itm) => itm===id);
  if(currentIndexOfId === -1) {
    throw new Error(`${id} not found.`);
  }
  const [position, number] = idToNumPos(id);
  let newIndex = currentIndexOfId+number;

  if(number === 0) {
    if (verbose) console.log(`${number} does not move`);
    return;
  }
  if(newIndex > (list.length-1)) {
    let numMovesRight = number % (list.length-1);
    if(currentIndexOfId+numMovesRight > (list.length-1)) {
      newIndex = numMovesRight-((list.length-1)-currentIndexOfId);
    } else {
      newIndex = currentIndexOfId+numMovesRight;
    }
  }
  else if(newIndex < 0) {
    let numMovesLeft = Math.abs(number) % (list.length-1);
    if(numMovesLeft > currentIndexOfId) {
      newIndex = (list.length-1) + currentIndexOfId - numMovesLeft;
    } else {
      newIndex = currentIndexOfId - numMovesLeft;
    }
  }

  if(number < 0 && newIndex === 0) {
    // Going left, put it at the end of the list if it's the first item now
    newIndex = list.length -1;
  }
  if(number > 0 && newIndex === list.length-1) {
    // Going right, put it at the start of the list if it's the last item now
    newIndex = 0;
  }

  if(currentIndexOfId === newIndex) {
    if (verbose) console.log(`${number} does not move`);
    return;
  }

  if(newIndex < 0 || newIndex > (list.length-1)) {
    throw new Error(`Out of bounds: ${newIndex}`);
  }

  if (verbose) {
    const currentNumAtNewPos = idToNum(list[newIndex]);
    let nextItemIndex;
    if(newIndex === 0) nextItemIndex = list.length-1;
    else if(newIndex === list.length-1) nextItemIndex = 0;
    else nextItemIndex = newIndex+1;
    const currentNumNextToNewPos = idToNum(list[nextItemIndex]);
    console.log(`${number} moves between ${currentNumAtNewPos} and ${currentNumNextToNewPos}, from ${currentIndexOfId} to ${newIndex}`);
  }

  moveItemInList(list, currentIndexOfId, newIndex);
}

const displayIdList = (numList) => {
  console.log(numList.map(idToNum).join(', ') + '\n');
}

const getGroveCoordinates = (inputData, decryptionMultiplier = 1, numberOfMixes = 1, verbose = false) => {
  const numbers = inputData.split('\n').map(toInt);
  const numberIdList = [];
  let num0id;
  for (let i in numbers) {
    const number = numbers[i] * decryptionMultiplier;
    const id = numToId(i, number);
    numberIdList.push(id);
    if (number === 0) num0id = id;
  }
  const numberIdListWorkingCopy = [...numberIdList];

  for(let i = 0; i<numberOfMixes; i++) {
    for (let numberId of numberIdList) {
      moveNumInList(numberId, numberIdListWorkingCopy, verbose);
      if(verbose) displayIdList(numberIdListWorkingCopy);
    }
  }

  // Find the 1000th, 2000th and 3000th number
  const index0 = numberIdListWorkingCopy.findIndex((itm) => itm === num0id);
  const wantedIndexes = [1000,2000,3000];
  let wantedNumbersSum = 0;
  for (let wantedIndex of wantedIndexes) {
    const realIndex = (wantedIndex + index0) % (numberIdListWorkingCopy.length);
    wantedNumbersSum += idToNum(numberIdListWorkingCopy[realIndex]);
  }
  return wantedNumbersSum;
}

const groveCoordinates = getGroveCoordinates(inputData);
console.log(groveCoordinates);

// Part 2
const realGroveCoordinates = getGroveCoordinates(inputData, 811589153, 10);
console.log(realGroveCoordinates);
