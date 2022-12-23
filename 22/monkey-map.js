const fs = require('fs');
const sampleData = fs.readFileSync('sample.txt', 'utf8');
const inputData = fs.readFileSync('input.txt', 'utf8');
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

const parseInput = (inputData, mode='flat') => {
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

  let cubeSize = 0;
  if(mode === 'cube') {
    const ySize = grid.length;
    const xSize = maxX + 1;
    const cubeLayout = xSize > ySize ? 'horizontal' : 'vertical';
    cubeSize = cubeLayout === 'horizontal' ? ((xSize) / 4) : (ySize / 4);

    const cube = new Map();
    for (let y = 0; y < grid.length; y++) {

      for (let x = 0; x < grid[y].length; x++) {
        if (grid[y][x] !== ' ') {

          const [faceY, faceX] = YXtoRelativeYXOnFace([y, x], cubeSize);

          const faceName = YXToFaceName([y, x], cubeSize);

          let face;
          if (!cube.has(faceName)) {
            face = [];
            cube.set(faceName, face);
          } else {
            face = cube.get(faceName);
          }

          if (!face[faceY]) face[faceY] = [];
          face[faceY][faceX] = grid[y][x];
        }

      }
    }
  }
  return {grid,instructions,cubeSize };
}

const YXToFaceName = ([y,x], cubeSize) => {
  const quadrantX = Math.floor((x)/cubeSize);
  const quadrantY = Math.floor( (y)/cubeSize);
  return `${quadrantY}.${quadrantX}`;
}

const YXtoRelativeYXOnFace = ([y,x], cubeSize) => {
  return [(y)%cubeSize,(x)%cubeSize];
}

const relativeYXOnFaceToYX = ([y,x], faceName, cubeSize) => {
  const [faceY,faceX] = faceNameYX(faceName);
  const realX =  ((faceX*(cubeSize))+x);
  const realY =((faceY*cubeSize))+y;
  return [realY, realX];
}

const drawGrid = (grid) => {
  const [wX,wY] = process.stdout.getWindowSize();
  console.clear();
  process.stdout.write('\u001B[?25l');//hide cursor
  for(let y=0; y<grid.length; y++) {
    for(let x=0; x<grid[y].length; x++) {
      if(x < wX && y< (wY-5)) {
        process.stdout.cursorTo(x, y);
        process.stdout.write(grid[y][x]);
      }
    }
  }
  process.stdout.cursorTo(0,grid.length);
};
const drawGridSync = (grid) => {
  const [wX,wY] = process.stdout.getWindowSize();
  for(let y=0; y<grid.length; y++) {
    for(let x=0; x<grid[y].length; x++) {
      if(x < wX && y< (wY-5)) {
        process.stdout.write(grid[y][x]);
      }
    }
    process.stdout.write('\n');
  }
  process.stdout.write('\n');
};

const drawCharAtPos = ([y,x], char) => {
  const [wX,wY] = process.stdout.getWindowSize();
  if(x < wX && y< wY) {
    process.stdout.cursorTo(x, y);
    process.stdout.write(char);
  }
}
const drawText = (text, bottomPad= 0) => {
  const [wX,wY] = process.stdout.getWindowSize();
  process.stdout.cursorTo(0, wY-5-bottomPad);
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

const getNextPosition = ([cY, cX, direction], grid, mode = 'cube', cubeSize) => {
  let nY, nX;
  let nD = direction;
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
    if(mode === 'flat') {
      [nY, nX] = findWrappingPosition([cY, cX], direction, grid);
      nD = direction;
    } else {
      [[nY, nX], nD] = findNextPositionFromCubeEdge([cY, cX], direction, cubeSize);
    }
  }

  if (isBlocked([nY, nX], grid)) {
    return false;
  }

  return [nY, nX, nD];
}

function* getNextPositions(currentPos, numSteps, direction, grid, mode = 'cube', cubeSize) {
  let workingPos = [...currentPos, direction];
  for(let s=0;s<numSteps; s++) {
    let newPos = getNextPosition(workingPos, grid, mode, cubeSize);
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

const findNextPositionFromCubeEdge = ([y,x], direction, cubeSize) => {
  const [relativeY, relativeX] = YXtoRelativeYXOnFace([y,x], cubeSize);
  const cubeFace = YXToFaceName([y,x], cubeSize);
  const maxXY = (cubeSize-1);
  let nextPositionMap;

  if(cubeSize === 4) {
    nextPositionMap = {
      '0.2': {
        '>': ['2.3', '<', flipPos(relativeY, cubeSize), maxXY],
        '^': ['1.0', 'v', 0, flipPos(relativeX, cubeSize)],
        '<': ['1.1', 'v', 0, flipPos(relativeY, cubeSize)],
      },
      '1.0': {
        '<': ['2.3', '<', maxXY, flipPos(relativeX, cubeSize)],
        '^': ['0.2', 'v', 0, flipPos(relativeX, cubeSize)],
        'v': ['2.2', '^', maxXY, flipPos(relativeX, cubeSize)],
      },
      '1.1': {
        '^': ['0.2', '>', relativeX, 0],
        'v': ['2.2', '>', flipPos(relativeX, cubeSize), maxXY]
      },
      '1.2': {
        '>': ['2.3', 'v', 0, flipPos(relativeY, cubeSize)],
      },
      '2.2': {
        '<': ['1.1', '^', maxXY, flipPos(relativeY, cubeSize)],
        'v': ['1.0', '^', maxXY, flipPos(relativeX, cubeSize)],
      },
      '2.3': {
        '^': ['1.2', '<', flipPos(relativeX, cubeSize), maxXY],
        '>': ['0.2', '<', maxXY, flipPos(relativeX, cubeSize)],
        'v': ['1.0', '>', flipPos(relativeX, cubeSize), 0],
      },
    }
  }
  else {
    nextPositionMap = {
      '0.1': {
        '^': ['3.0', '>', relativeX, 0],
        '<': ['2.0', '>', flipPos(relativeY, cubeSize), 0],
      },
      '0.2': {
        '^': ['3.0', '^', maxXY, relativeX],
        '>': ['2.1', '<', flipPos(relativeY, cubeSize), maxXY],
        'v': ['1.1', '<', relativeX, maxXY],
      },
      '1.1': {
        '>': ['0.2', '^', maxXY, relativeY],
        '<': ['2.0', 'v', 0, relativeY],
      },
      '2.1': {
        'v': ['3.0', '<', relativeX, maxXY],
        '>': ['0.2', '<', flipPos(relativeY, cubeSize), maxXY],
      },
      '2.0': {
        '^': ['1.1', '>', relativeX, 0],
        '<': ['0.1', '>', flipPos(relativeY, cubeSize), 0],
      },
      '3.0': {
        '<': ['0.1', 'v', 0, relativeY],
        'v': ['0.2', 'v', 0, relativeX],
        '>': ['2.1', '^', maxXY, relativeY],
      },
    }
  }

  const [newCubeFace, newDirection, newRelativeY, newRelativeX] = nextPositionMap[cubeFace][direction];

  if(newRelativeY === undefined) {
    throw new Error('Unsupported coordinates');
  }

  const newRealYX = relativeYXOnFaceToYX([newRelativeY,newRelativeX], newCubeFace, cubeSize);
  return [newRealYX, newDirection];
}

const faceNameYX = (faceName) => faceName.split('.').map((str) => parseInt(str, 10));
const flipPos = (num, cubeSize) => {
  return Math.abs(-num + (cubeSize-1));
}

const getEndState = (inputData, mode) => {
  const {grid, instructions, cubeSize} = parseInput(inputData, mode);
  let currentPosition = findStartingPosition(grid);
  let direction = '>';
  for (let inst of instructions) {
    if(inst === 'R'||inst === 'L') {
      direction = getNewDirection(direction, inst);
    } else {
      for(let [nY,nX,nD] of getNextPositions(currentPosition, inst, direction, grid, mode, cubeSize)) {
        currentPosition = [nY,nX];
        direction = nD;
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

const getPasswordFromInput = (inputData, mode) => {
  const [endPosition, endDirection] = getEndState(inputData, mode);
  return determinePassword(endPosition, endDirection);
};

const draw = async (inputData, mode) => {
  const {grid, instructions, cubeSize} = parseInput(inputData,mode);
  let currentPosition = findStartingPosition(grid);
  let direction = '>';
  console.clear();
  drawGrid(grid);
  for (let inst of instructions) {
    if(inst === 'R'||inst === 'L') {
      drawText(`Current position: ${currentPosition[0]},${currentPosition[1]}`,0);
      drawText(`Rotating ${inst}`, 1);
      direction = getNewDirection(direction, inst);
      drawCharAtPos(currentPosition, `\x1b[1m\x1b[36m${direction}\x1b[0m`);
      await delay(100);
    } else {
      let c = 0;
      for(let [nY,nX,nD] of getNextPositions(currentPosition, inst, direction, grid, mode, cubeSize)) {
        drawCharAtPos(currentPosition, `\x1b[32m${direction}\x1b[0m`);
        drawText(`Current position: ${currentPosition[0]},${currentPosition[1]}`,0);
        drawText(`Moving ${direction} ${c.toString(10).padStart(2, ' ')}/${inst}`,1);
        drawCharAtPos([nY,nX], `\x1b[1m\x1b[36m${nD}\x1b[0m`);
        currentPosition = [nY,nX];
        direction = nD;
        await delay(100);
        c++;
      }
    }
  }
  drawCharAtPos(currentPosition, `\x1b[1m\x1b[31m${direction}\x1b[0m`);
  return [currentPosition, direction];
}

// Part 1
const password = getPasswordFromInput(inputData, 'flat');
console.log(password);

// Part 2
const finalPassword = getPasswordFromInput(inputData, 'cube');
console.log(finalPassword);

// Part 3
// draw(sampleData, 'cube').then(([p,d]) => {
//   const password = determinePassword(p, d);
//   drawText(`Password: \x1b[1m\x1b[32m${password.toString(10)}\x1b[0m`,2);
// });
// draw(sampleData, 'flat').then(([p,d]) => {
//   const password = determinePassword(p, d);
//   drawText(`Password: \x1b[1m\x1b[32m${password.toString(10)}\x1b[0m`,2);
// });