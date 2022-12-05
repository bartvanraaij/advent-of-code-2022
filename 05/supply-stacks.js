const fs = require('fs');
const mode = 'input';
const rawData = fs.readFileSync(`${mode}.txt`, 'utf8');

const input = rawData.split("\n");

// Find the first blank line
const blankLineIndex = input.findIndex((value) =>  value === '');

const startingGridTxt = input.slice(0, blankLineIndex-1);
const instructionLinesTxt = input.slice(blankLineIndex+1);

const parseGrid = (startingGridTxt) => {
  // Parse the starting grid
  const startingGridClean = startingGridTxt.map(str => {
    return str.replaceAll(new RegExp('[\[\\]]', 'g'), '')
      .replaceAll('  ', ' ');
  });
  const highestStack = startingGridClean.length;
  const numStacks = Math.floor((startingGridClean[startingGridClean.length-1]).length / 2) +1;
  let grid = [];
  for(let i=0; i<numStacks; i++) {
    let thisStack = [];
    for(let j=(highestStack-1); j>=0; j--) {
      const crateAt = startingGridClean[j][i*2] ?? ' ';
      if(crateAt !== ' ') thisStack.push(crateAt);
    }
    grid.push(thisStack);
  }
  return grid;
}

// Instruction lines
const parseInstructionText = (input) => {
  const [move, from, to] = input.match(/\d+/g).map((str) => parseInt(str, 10));
  return {
    move,
    from: from-1,
    to: to-1
  };
}

const getTopCrate = (stack) => stack[stack.length-1];
const getTopCrates = (grid) => {
  let topCrates = [];
  for(let i=0; i<grid.length; i++) {
    topCrates.push(getTopCrate(grid[i]));
  }
  return topCrates;
};

let grid = parseGrid(startingGridTxt);
const instructionLines = instructionLinesTxt.map(parseInstructionText);
// Part 1
for(const instructionLine of instructionLines) {
  for(let i=1; i<=instructionLine.move; i++) {
    const crate = getTopCrate(grid[instructionLine.from]);
    grid[instructionLine.to].push(crate);
    grid[instructionLine.from].pop();
  }
}

const topCratesStr1 = getTopCrates(grid).join('')
console.log(topCratesStr1);

// Part 2
grid = parseGrid(startingGridTxt);
for(const instructionLine of instructionLines) {
  const cratesToMove = grid[instructionLine.from].slice(
    -instructionLine.move
  );
  grid[instructionLine.to] = [...grid[instructionLine.to], ...cratesToMove];
  grid[instructionLine.from] = grid[instructionLine.from].slice(0, grid[instructionLine.from].length - instructionLine.move);
}

const topCratesStr2 = getTopCrates(grid).join('')
console.log(topCratesStr2);
