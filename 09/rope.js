const fs = require('fs');
const rawData = fs.readFileSync('input.txt', 'utf8');

const instructions = rawData.split("\n").map((str) => {
  let [dir,num] = str.split(' ');
  return { dir, steps: parseInt(num, 10) }
});

const determineNewPosition = (pos, dir) => {
  if(dir === 'R') {
    return { x: pos.x+1, y: pos.y };
  }
  if(dir === 'U') {
    return { x: pos.x, y: pos.y+1 };
  }
  if(dir === 'L') {
    return { x: pos.x-1, y: pos.y };
  }
  if(dir === 'D') {
    return { x: pos.x, y: pos.y-1 };
  }
  if(dir === 'RU') {
    return { x: pos.x+1, y: pos.y+1 };
  }
  if(dir === 'RD') {
    return { x: pos.x+1, y: pos.y-1 };
  }
  if(dir === 'LU') {
    return { x: pos.x-1, y: pos.y+1 };
  }
  if(dir === 'LD') {
    return { x: pos.x-1, y: pos.y-1 };
  }
}

const determineNewKnotPosition = (hp, tp, headDir) => {
  if(hp.x === tp.x && hp.y === tp.y) {
    // Overlapping, do nothing
    return tp;
  }
  let diffX = Math.abs(hp.x - tp.x);
  let diffY = Math.abs(hp.y - tp.y);
  if(diffX <= 1 && diffY <= 1) {
    // Adjacent, do nothing
    return tp;
  }

  if(hp.x > tp.x && hp.y === tp.y) {
    // Head is to the right move along the same direction
    return determineNewPosition(tp, 'R');
  }
  if(hp.x !== tp.x && hp.y === tp.y) {
    // Head is to the right or left, move along the same direction
    return determineNewPosition(tp, hp.x > tp.x ? 'R':'L');
  }
  if(hp.x === tp.x && hp.y !== tp.y) {
    // Head is to the top or bottom, move along the same direction
    return determineNewPosition(tp, hp.y > tp.y ? 'U':'D');
  }
  if(hp.x > tp.x && hp.y > tp.y) {
    // Head is to top right, move tail right up diagonally
    return determineNewPosition(tp, 'RU');
  }
  if(hp.x < tp.x && hp.y > tp.y) {
    // Head is to top left, move tail left up
    return determineNewPosition(tp, 'LU');
  }
  if(hp.x > tp.x && hp.y < tp.y) {
    // Head is to bottom right, move tail right down
    return determineNewPosition(tp, 'RD');
  }
  if(hp.x < tp.x && hp.y < tp.y) {
    // Head is to bottom left, move tail left down
    return determineNewPosition(tp, 'LD');
  }
};

const allHeadPositions = [{
  x: 0, y: 0
}];
const allTailPositions = [{
  x: 0, y: 0
}];

const drawGrid = (hp, tp, gridSize = 6) => {
  const lines = [];
  for(let i=0; i<gridSize; i++) {
    let line = '';
    for(let j=0; j<gridSize; j++) {
      if(hp.x === j && hp.y===i) line += 'H';
      else if(tp.x === j && tp.y===i) line += 'T';
      else line += '.';
    }
    lines.push(line);
  }
  const reversed = lines.reverse();
  console.log(reversed.join("\n") + "\n");
}

// drawGrid({x:0, y:0},{x:0, y:0});

// Part 1
for(let {dir, steps} of instructions) {
  // console.log(`== ${dir} ${steps} ==\n`);
  for(let i=0; i<steps; i++) {
    // Current head position
    let chp = allHeadPositions[allHeadPositions.length-1];
    // New head position
    const nhp = determineNewPosition(chp, dir);
    allHeadPositions.push(nhp);

    // Current tail position
    let ctp = allTailPositions[allTailPositions.length-1];
    // New tail position
    const ntp = determineNewKnotPosition(nhp, ctp, dir);
    allTailPositions.push(ntp);

    // drawGrid(nhp, ntp);
  }
}

const allTailPositionsAsStrings = allTailPositions.map(({x,y}) => `${x}.${y}`);
const allUniqueTailPositions = [...new Set(allTailPositionsAsStrings)];
console.log(allUniqueTailPositions.length);

// Part 2
const numKnots = 10;

const setupKnots = (numKnots, initialX = 0, initialY = 0) => {
  let arr = [];
  for(let i=0; i<numKnots; i++) {
    arr.push([{x:initialX,y:initialY}]);
  }
  return arr;
}

const allKnotPositions = setupKnots(numKnots, -140, -200);

for(let {dir, steps} of instructions) {

  for(let i=0; i < steps; i++) {
    // Current position of head
    let chp = allKnotPositions[0][(allKnotPositions[0].length)-1];
    // New head position
    const nhp = determineNewPosition(chp, dir);
    allKnotPositions[0].push(nhp);

    // All following knots:
    for(let j=1; j < numKnots; j++) {
      // Current position of this knot
      let ckp = allKnotPositions[j][allKnotPositions[j].length-1];

      // New position of previous knot
      let npkp = allKnotPositions[j-1][allKnotPositions[j-1].length-1];

      // New knot position
      const nkp = determineNewKnotPosition(npkp, ckp, dir);
      allKnotPositions[j].push(nkp);
    }
  }
}

const allNewTailPositions = allKnotPositions[9];
const allNewTailPositionsAsStrings = allNewTailPositions.map(({x,y}) => `${x}.${y}`);
const allNewUniqueTailPositions = [...new Set(allNewTailPositionsAsStrings)];
console.log(allNewUniqueTailPositions.length);