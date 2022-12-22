const fs = require('fs');
const sampleData = fs.readFileSync('sample.txt', 'utf8');
const inputData = fs.readFileSync('input.txt', 'utf8');
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

const parseInput = (inputData) => {
  let [map, instructionsLine] = inputData.split('\n\n');
  const instructions = Array.from(instructionsLine.matchAll(/((\d+)|([LR]))/g)).map((regexMatchArr) => {
    if(regexMatchArr[0] ==='L' || regexMatchArr[0] ==='R') {
      return regexMatchArr[0];
    } else {
      return parseInt(regexMatchArr[0], 10);
    }
  });
  const grid = []; // let's do Y,X again, top to bottom, left to right
  let maxX = 0;
  for(let line of map.split("\n")) {
    if((line.length-1) > maxX) maxX = line.length-1;
  }

  for(let line of map.split("\n")) {
    const row = [];
    for(let i=0;i<=maxX; i++){
      row.push(line.charAt(i) || ' ');
    }
    grid.push(row);
  }
  console.log(maxX);
  return {grid,instructions};
}

const windowSize = process.stdout.getWindowSize();
const wX = windowSize[0];
const wY = windowSize[1];

const drawGrid = (grid) => {
  console.clear();
  for(let y=0; y<grid.length; y++) {
    for(let x=0; x<grid[y].length; x++) {
      if(x < wX && y< (wY-5)) {
        process.stdout.cursorTo(x, y);
        process.stdout.write(grid[y][x]);
      }
    }
    // process.stdout.write('\n');
  }
  process.stdout.cursorTo(0,process.stdout.getWindowSize()[1]);
};
const drawCharAtPos = ([y,x], char) => {
  if(x < wX && y< wY) {
    process.stdout.cursorTo(x, y);
    process.stdout.write(char);
  }
}
const drawText = (text) => {
  process.stdout.cursorTo(0, wY);
  process.stdout.write(text.padEnd(wX-5, ' '));
}

const findStartingPosition = (grid) => {
  return [0,grid[0].findIndex(t => t==='.')];
}

const findWrappingPosition = ([y,x], direction, grid) => {
  if(direction === '>') {
    return [y,grid[y].findIndex(t => t==='.' || t==='#')];
  }
  if(direction === '<') {
    const row = grid[y];
    const rowReversed = [...grid[y]].reverse();
    const firstTilePos = rowReversed.findIndex(t => t==='.'|| t==='#');
    const actualPos = row.length - firstTilePos -1;
    return [y, actualPos];
  }
  if(direction === 'v') {
    return [grid.findIndex(row => row[x] ==='.' || row[x] ==='#'), x];
  }
  if(direction === '^') {
    return [grid.length - ([...grid].reverse().findIndex(row => row[x] ==='.' || row[x] ==='#')) -1, x];
  }
}

const isVoid = ([y, x], grid) => {
  return (y<0 || x<0 || y > (grid.length-1) || grid[y][x] === undefined || grid[y][x] === ' ');
}
const isBlocked = ([y, x], grid) => {
  return (grid[y][x] === '#');
}

const getNextPosition = ([cY,cX], direction, grid) => {
  let nY, nX;

  if (direction === '>') {
    nY = cY;
    nX = cX + 1;
  }
  if (direction === '<') {
    nY = cY;
    nX = cX - 1;
  }
  if (direction === '^') {
    nY = cY-1;
    nX = cX;
  }
  if (direction === 'v') {
    nY = cY+1;
    nX = cX;
  }
  if (isVoid([nY, nX], grid)) {
    [nY, nX] = findWrappingPosition([cY, cX], direction, grid);
  }

  if (isBlocked([nY, nX], grid)) {
    return false;
  }

  return [nY, nX];
}


function* getNextPositions(currentPos, numSteps, direction, grid) {
  let workingPos = currentPos;
  for(let s=0;s<numSteps; s++) {
    let newPos = getNextPosition(workingPos, direction, grid);
    if(newPos === false) return;//Blocked
    workingPos = newPos;
    yield newPos;
  }
}

const getNewDirection = (curr, rotate) => {
  if(curr === '>') {
    return rotate==='R' ? 'v':'^';
  }
  if(curr === 'v') {
    return rotate==='R' ? '<':'>';
  }
  if(curr === '<') {
    return rotate==='R' ? '^':'v';
  }
  if(curr === '^') {
    return rotate==='R' ? '>':'<';
  }
}

const directions = ['>','v','<','^'];

const draw = async (inputData) => {
  const {grid, instructions} = parseInput(inputData);
  let currentPosition = findStartingPosition(grid);
  let direction = '>';
  console.clear();
  drawGrid(grid);
  // drawCharAtPos(currentPosition, '@');
  drawCharAtPos(currentPosition, direction);
  for (let inst of instructions) {

    if(inst === 'R'||inst === 'L') {
      drawText(`Rotating ${inst}`);
      direction = getNewDirection(direction, inst);
    } else {
      drawText(`Moving ${inst} ${direction}: ${'0'.padStart(2, ' ')}/${inst}`);
      let c = 0;
      for(let newPos of getNextPositions(currentPosition, inst, direction, grid)) {
        drawText(`Moving ${inst} ${direction}: ${c.toString(10).padStart(2, ' ')}/${inst}`);
        drawCharAtPos(newPos, direction);
        currentPosition = newPos;
        await delay(500);
        c++;
      }
    }
    // drawText(`Blocked at ${currentPosition.join(',')}`);
    await delay(500);
    drawCharAtPos(currentPosition, direction);
  }
  process.stdout.cursorTo(...process.stdout.getWindowSize());
  return [currentPosition, direction];
}

const getEndState = (inputData) => {
  const {grid, instructions} = parseInput(inputData);
  let currentPosition = findStartingPosition(grid);
  let direction = '>';
  for (let inst of instructions) {
    if(inst === 'R'||inst === 'L') {
      direction = getNewDirection(direction, inst);
    } else {
      for(let newPos of getNextPositions(currentPosition, inst, direction, grid)) {
        currentPosition = newPos;
      }
    }
  }
  return [currentPosition, direction];
}

const determinePassword = (position, direction) => {
  const rowScore = (position[0]+1) * 1000;
  const colScore = (position[1]+1) * 4;
  const directionScore = directions.findIndex((d) => d===direction);

  return rowScore + colScore + directionScore;
}

const getPasswordFromInput = (inputData) => {
  const [endPosition, endDirection] = getEndState(inputData);
  return determinePassword(endPosition, endDirection);
};

// draw(sampleData).then(([p,d]) => {
//   console.log(determinePassword(p, d));
// });
const password = getPasswordFromInput(inputData);
console.log(password);