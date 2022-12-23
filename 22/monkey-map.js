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

          const [cubeSideY, cubeSideX] = realYXtoYxOnCubeSide([y, x], cubeSize);

          const cubeSideName = realYXtoCubeSideName([y, x], cubeSize);

          let cubeSide;
          if (!cube.has(cubeSideName)) {
            cubeSide = [];
            cube.set(cubeSideName, cubeSide);
          } else {
            cubeSide = cube.get(cubeSideName);
          }

          if (!cubeSide[cubeSideY]) cubeSide[cubeSideY] = [];
          cubeSide[cubeSideY][cubeSideX] = grid[y][x];
        }

      }
    }
  }
  return {grid,instructions,cubeSize };
}

const realYXtoCubeSideName = ([y,x], cubeSize) => {
  const quadrantX = Math.floor((x)/cubeSize);
  const quadrantY = Math.floor( (y)/cubeSize);
  return `${quadrantY}.${quadrantX}`;
}

const realYXtoYxOnCubeSide = ([y,x], cubeSize) => {
  return [(y)%cubeSize,(x)%cubeSize];
}

const cubeSideYXToRealYX = ([y,x], cubeSideName, cubeSize) => {
  const [cubeSideY,cubeSideX] = csNameYX(cubeSideName);
  const realX =  ((cubeSideX*(cubeSize))+x);
  const realY =((cubeSideY*cubeSize))+y;
  return [realY, realX];
}

const windowSize = process.stdout.getWindowSize();
const wX = windowSize[0];
const wY = windowSize[1];

const drawGrid = (grid) => {
  console.clear();
  process.stdout.write('\u001B[?25l');//hide cursor
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
const drawGridSync = (grid) => {
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
  if(x < wX && y< wY) {
    process.stdout.cursorTo(x, y);
    process.stdout.write(char);
  }
}
const drawText = (text, bottomPad=0) => {
  process.stdout.cursorTo(0, wY-bottomPad);
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

const getNextPosition = ([cY, cX, direction], grid, mode = 'cube', cubeSize, data = 'input') => {
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
      if (data === 'sample') {
        [[nY, nX], nD] = findNextPositionFromCubeEdgeSampleData([cY, cX], direction, cubeSize);
      } else {
        [[nY, nX], nD] = findNextPositionFromCubeEdgeInputData([cY, cX], direction, cubeSize);
      }
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

const draw = async (inputData) => {
  const {grid, instructions} = parseInput(inputData);
  let currentPosition = findStartingPosition(grid);
  let direction = '>';
  console.clear();
  drawGrid(grid);
  drawCharAtPos(currentPosition, direction);
  for (let inst of instructions) {

    if(inst === 'R'||inst === 'L') {
      drawText(`Rotating ${inst}`);
      direction = getNewDirection(direction, inst);
      await delay(150);
    } else {
      drawText(`Moving ${inst} ${direction}: ${'0'.padStart(2, ' ')}/${inst}`);
      let c = 0;
      for(let [nY,nX] of getNextPositions(currentPosition, inst, direction, grid, 'flat')) {
        drawText(`Moving ${inst} ${direction}: ${c.toString(10).padStart(2, ' ')}/${inst}`);
        drawCharAtPos([nY,nX], direction);
        currentPosition = [nY,nX];
        await delay(500);
        c++;
      }
    }
    await delay(150);
    drawCharAtPos(currentPosition, direction);
  }
  process.stdout.cursorTo(...process.stdout.getWindowSize());
  return [currentPosition, direction];
}

const findNextPositionFromCubeEdgeSampleData = ([y,x], direction, cubeSize) => {
  const [yOnCubeSide, xOnCubeSide] = realYXtoYxOnCubeSide([y,x], cubeSize);
  const cubeSideName = realYXtoCubeSideName([y,x], cubeSize);

  if(cubeSideName==='0.2') {
    if(direction==='>') {
      let newCubeSide = '2.3'
      let newDirection = '<';
      let newYOnCubeSide = flipPos(yOnCubeSide, cubeSize);
      let newXOnCubeSide = (cubeSize-1);
      return [cubeSideYXToRealYX([newYOnCubeSide,newXOnCubeSide], newCubeSide, cubeSize), newDirection];
    }
    if(direction==='^') {
      let newCubeSide = '1.0'
      let newDirection = 'v';
      let newXOnCubeSide = flipPos(xOnCubeSide, cubeSize);
      let newYOnCubeSide = 0;
      return [cubeSideYXToRealYX([newYOnCubeSide,newXOnCubeSide], newCubeSide, cubeSize), newDirection];
    }
    if(direction==='<') {
      let newCubeSide = '1.1'
      let newDirection = 'v';
      let newXOnCubeSide = flipPos(yOnCubeSide, cubeSize);
      let newYOnCubeSide = 0;
      return [cubeSideYXToRealYX([newYOnCubeSide,newXOnCubeSide], newCubeSide, cubeSize), newDirection];
    }
  }
  if(cubeSideName==='1.0') {
    if(direction==='<') {
      let newCubeSide = '2.3'
      let newDirection = '<^';
      let newYOnCubeSide = (cubeSize-1);
      let newXOnCubeSide = flipPos(xOnCubeSide, cubeSize);
      return [cubeSideYXToRealYX([newYOnCubeSide,newXOnCubeSide], newCubeSide, cubeSize), newDirection];
    }
    if(direction==='^') {
      let newCubeSide = '0.2'
      let newDirection = 'v';
      let newXOnCubeSide = flipPos(xOnCubeSide, cubeSize);
      let newYOnCubeSide = 0;
      return [cubeSideYXToRealYX([newYOnCubeSide,newXOnCubeSide], newCubeSide, cubeSize), newDirection];
    }
    if(direction==='v') {
      let newCubeSide = '2.2'
      let newDirection = '^';
      let newXOnCubeSide = flipPos(xOnCubeSide, cubeSize);
      let newYOnCubeSide = cubeSize;
      return [cubeSideYXToRealYX([newYOnCubeSide,newXOnCubeSide], newCubeSide, cubeSize), newDirection];
    }
  }
  if(cubeSideName==='1.1') {
    if(direction==='^') {
      let newCubeSide = '0.2'
      let newDirection = '>';
      let newXOnCubeSide = 0;
      let newYOnCubeSide = xOnCubeSide;
      return [cubeSideYXToRealYX([newYOnCubeSide,newXOnCubeSide], newCubeSide, cubeSize), newDirection];
    }
    if(direction==='v') {
      let newCubeSide = '2.2'
      let newDirection = '>';
      let newXOnCubeSide = (cubeSize-1);
      let newYOnCubeSide = flipPos(xOnCubeSide, cubeSize);
      return [cubeSideYXToRealYX([newYOnCubeSide,newXOnCubeSide], newCubeSide, cubeSize), newDirection];
    }
  }
  if(cubeSideName==='1.2') {
    if(direction==='>') {
      let newCubeSide = '2.3'
      let newDirection = 'v';
      let newXOnCubeSide = flipPos(yOnCubeSide, cubeSize);
      let newYOnCubeSide = 0;
      let [ry,rx] = cubeSideYXToRealYX([newYOnCubeSide,newXOnCubeSide],newCubeSide, cubeSize);
      return [[ry,rx], newDirection];
    }
  }
  if(cubeSideName==='2.2') {
    if(direction==='<') {
      let newCubeSide = '1.1'
      let newDirection = '^';
      let newXOnCubeSide = flipPos(yOnCubeSide, cubeSize);
      let newYOnCubeSide = (cubeSize-1);
      return [cubeSideYXToRealYX([newYOnCubeSide,newXOnCubeSide], newCubeSide, cubeSize), newDirection];
    }
    if(direction==='v') {
      let newCubeSide = '1.0'
      let newDirection = '^';
      let newXOnCubeSide = flipPos(xOnCubeSide, cubeSize);
      let newYOnCubeSide = (cubeSize-1);
      return [cubeSideYXToRealYX([newYOnCubeSide,newXOnCubeSide], newCubeSide, cubeSize), newDirection];
    }
  }
  if(cubeSideName==='2.3') {
    if(direction==='^') {
      let newCubeSide = '1.2'
      let newDirection = '<';
      let newXOnCubeSide = (cubeSize-1);
      let newYOnCubeSide = flipPos(xOnCubeSide, cubeSize);;
      return [cubeSideYXToRealYX([newYOnCubeSide,newXOnCubeSide], newCubeSide, cubeSize), newDirection];
    }
    if(direction==='>') {
      let newCubeSide = '0.2'
      let newDirection = '<';
      let newXOnCubeSide = flipPos(xOnCubeSide, cubeSize);
      let newYOnCubeSide = (cubeSize-1);
      return [cubeSideYXToRealYX([newYOnCubeSide,newXOnCubeSide], newCubeSide, cubeSize), newDirection];
    }
    if(direction==='v') {
      let newCubeSide = '1.0'
      let newDirection = '>';
      let newXOnCubeSide = 0;
      let newYOnCubeSide = flipPos(xOnCubeSide, cubeSize);
      return [cubeSideYXToRealYX([newYOnCubeSide,newXOnCubeSide], newCubeSide, cubeSize), newDirection];
    }
  }

  console.log({y,x, direction, cubeSize});
  throw new Error('Unsupported');
}
const findNextPositionFromCubeEdgeInputData = ([y,x], direction, cubeSize) => {
  const [yOnCubeSide, xOnCubeSide] = realYXtoYxOnCubeSide([y,x], cubeSize);
  const cubeSideName = realYXtoCubeSideName([y,x], cubeSize);
  const maxXY = (cubeSize-1);
  if(cubeSideName==='0.1') {
    if(direction==='^') {
      let newCubeSide = '3.0'
      let newDirection = '>';
      let newYOnCubeSide = xOnCubeSide;
      let newXOnCubeSide = 0;
      return [cubeSideYXToRealYX([newYOnCubeSide,newXOnCubeSide], newCubeSide, cubeSize), newDirection];
    }
    if(direction==='<') {
      let newCubeSide = '2.0'
      let newDirection = '>';
      let newXOnCubeSide = 0;
      let newYOnCubeSide = flipPos(yOnCubeSide, cubeSize);
      return [cubeSideYXToRealYX([newYOnCubeSide,newXOnCubeSide], newCubeSide, cubeSize), newDirection];
    }
  }
  if(cubeSideName==='0.2') {
    if(direction==='^') {
      let newCubeSide = '3.0'
      let newDirection = '^';
      let newYOnCubeSide = maxXY;
      let newXOnCubeSide = xOnCubeSide;
      return [cubeSideYXToRealYX([newYOnCubeSide,newXOnCubeSide], newCubeSide, cubeSize), newDirection];
    }
    if(direction==='>') {
      let newCubeSide = '2.1'
      let newDirection = '<';
      let newXOnCubeSide = maxXY;
      let newYOnCubeSide = flipPos(yOnCubeSide, cubeSize);
      return [cubeSideYXToRealYX([newYOnCubeSide,newXOnCubeSide], newCubeSide, cubeSize), newDirection];
    }
    if(direction==='v') {
      let newCubeSide = '1.1'
      let newDirection = '<';
      let newXOnCubeSide = maxXY;
      let newYOnCubeSide = xOnCubeSide;
      return [cubeSideYXToRealYX([newYOnCubeSide,newXOnCubeSide], newCubeSide, cubeSize), newDirection];
    }
  }
  if(cubeSideName==='1.1') {
    if(direction==='>') {
      let newCubeSide = '0.2'
      let newDirection = '^';
      let newYOnCubeSide = maxXY;
      let newXOnCubeSide = yOnCubeSide;
      return [cubeSideYXToRealYX([newYOnCubeSide,newXOnCubeSide], newCubeSide, cubeSize), newDirection];
    }
    if(direction==='<') {
      let newCubeSide = '2.0'
      let newDirection = 'v';
      let newXOnCubeSide = yOnCubeSide;
      let newYOnCubeSide = 0;
      return [cubeSideYXToRealYX([newYOnCubeSide,newXOnCubeSide], newCubeSide, cubeSize), newDirection];
    }
  }
  if(cubeSideName==='2.1') {
    if(direction==='v') {
      let newCubeSide = '3.0'
      let newDirection = '<';
      let newYOnCubeSide = xOnCubeSide;
      let newXOnCubeSide = maxXY;
      return [cubeSideYXToRealYX([newYOnCubeSide,newXOnCubeSide], newCubeSide, cubeSize), newDirection];
    }
    if(direction==='>') {
      let newCubeSide = '0.2'
      let newDirection = '<';
      let newYOnCubeSide = flipPos(yOnCubeSide, cubeSize);
      let newXOnCubeSide = cubeSize-1;
      return [cubeSideYXToRealYX([newYOnCubeSide,newXOnCubeSide], newCubeSide, cubeSize), newDirection];
    }
  }
  if(cubeSideName==='2.0') {
    if(direction==='^') {
      let newCubeSide = '1.1'
      let newDirection = '>';
      let newYOnCubeSide = xOnCubeSide;
      let newXOnCubeSide = 0;
      return [cubeSideYXToRealYX([newYOnCubeSide,newXOnCubeSide], newCubeSide, cubeSize), newDirection];
    }
    if(direction==='<') {
      let newCubeSide = '0.1'
      let newDirection = '>';
      let newYOnCubeSide = flipPos(yOnCubeSide, cubeSize);
      let newXOnCubeSide = 0;
      return [cubeSideYXToRealYX([newYOnCubeSide,newXOnCubeSide], newCubeSide, cubeSize), newDirection];
    }
  }
  if(cubeSideName==='3.0') {
    if(direction==='<') {
      let newCubeSide = '0.1'
      let newDirection = 'v';
      let newYOnCubeSide = 0;
      let newXOnCubeSide = yOnCubeSide;
      return [cubeSideYXToRealYX([newYOnCubeSide,newXOnCubeSide], newCubeSide, cubeSize), newDirection];
    }
    if(direction==='v') {
      let newCubeSide = '0.2'
      let newDirection = 'v';
      let newYOnCubeSide = 0;
      let newXOnCubeSide = xOnCubeSide;
      return [cubeSideYXToRealYX([newYOnCubeSide,newXOnCubeSide], newCubeSide, cubeSize), newDirection];
    }
    if(direction==='>') {
      let newCubeSide = '2.1'
      let newDirection = '^';
      let newYOnCubeSide =maxXY;
      let newXOnCubeSide = yOnCubeSide;
      return [cubeSideYXToRealYX([newYOnCubeSide,newXOnCubeSide], newCubeSide, cubeSize), newDirection];
    }
  }

  console.trace();
  console.log({y,x, cubeSideName,direction,  cubeSize});
  throw new Error('unsupported');

}
const csNameYX = (cubeSideName) => cubeSideName.split('.').map((str) => parseInt(str, 10));
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

// draw(sampleData).then(([p,d]) => {
//   console.log(determinePassword(p, d));
// });
const password = getPasswordFromInput(inputData, 'flat');
console.log(password);


// Part 2
const draw2 = async (inputData) => {
  const {grid, instructions, cubeSize} = parseInput(inputData);
  let currentPosition = findStartingPosition(grid);
  let direction = '>';
  console.clear();
  drawGrid(grid);
  drawCharAtPos(currentPosition, direction);
  for (let inst of instructions) {
    if(inst === 'R'||inst === 'L') {
      drawText(`Rotating ${inst}`);
      direction = getNewDirection(direction, inst);
      await delay(150);
    } else {
      drawText(`Moving ${inst} ${direction}: ${'0'.padStart(2, ' ')}/${inst}`);
      let c = 0;
      for(let [nY,nX,nD] of getNextPositions(currentPosition, inst, direction, grid, 'cube', cubeSize)) {
        drawText(`Moving ${inst} ${direction}: ${c.toString(10).padStart(2, ' ')}/${inst}`);
        drawText(`Current position: ${nY},${nX}`, 1);
        drawCharAtPos([nY,nX], `\x1b[1m\x1b[32m${nD}\x1b[0m`);
        currentPosition = [nY,nX];
        direction = nD;
        await delay(100);
        c++;
      }
    }
    await delay(150);
    drawCharAtPos(currentPosition, `\x1b[1m\x1b[32m${direction}\x1b[0m`);
  }
  process.stdout.cursorTo(...process.stdout.getWindowSize());
  return [currentPosition, direction];
}

const p2 = getPasswordFromInput(inputData, 'cube');
console.log(p2);
