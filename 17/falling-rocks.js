const fs = require('fs');
const inputData = fs.readFileSync('input.txt', 'utf8');
const sampleData = fs.readFileSync('sample.txt', 'utf8');

String.prototype.toInt = function () {
  return parseInt(this,10);
}

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

const yxCoord = ([y,x]) => `${y}.${x}`;
const coordYx = (coord) => coord.split(".").map((str) => str.toInt());
const CHAMBER_WIDTH = 7;
// Define all rock shapes as y,x (!) coords
const rockShapes = [
  [
    [0,0],[0,1],[0,2],[0,3]
  ],
  [
    [0,1],[1,0],[1,1],[1,2],[2,1]
  ],
  [
    [0,0],[0,1],[0,2],[1,2],[2,2]
  ],
  [
    [0,0],[1,0],[2,0],[3,0]
  ],
  [
    [0,0],[0,1],[1,0],[1,1]
  ],
];

const drawRockShape = (rockShape) => {
  const shapeStrs = rockShape.map(yxCoord);
  for(let j = 4; j>=0; j--) {
    for(let i = 0; i<4; i++) {
      if(shapeStrs.includes(yxCoord([j,i]))) {
        process.stdout.write('#');
      } else {
        process.stdout.write('.');
      }
    }
    process.stdout.write('\n');
  }
  process.stdout.write('\n');
}

const rockHasPoint = (rockShape, [y,x]) => {
  for(let [rY, rX] of rockShape) {
    if(rY === y && rX ===x) return true;
  }
  return false;
}

const getRelativeRockPoints = (rockShape, [y,x]) => {
  return rockShape.map(([rY, rX]) => [(rY+y), (rX+x)]);
}

const drawAllRocks = (activeRock, activeRockPos, rockStack) => {
  let freeLevel = getFreeLevelY(rockStack);
  let drawingSpace = 8;

  const activeRockRelativePointsStrs = getRelativeRockPoints(activeRock, activeRockPos).map(yxCoord);

  for(let j = (freeLevel+drawingSpace); j>=0; j--) {
    for(let i = 0; i<CHAMBER_WIDTH; i++) {
      let foundAPoint = false;
      const thisPointCoord = yxCoord([j,i]);
      if(rockStack.has(thisPointCoord)) {
        process.stdout.write('#');
      } else if(activeRockRelativePointsStrs.includes(thisPointCoord)) {
        process.stdout.write('@');
      } else {
        process.stdout.write('.');
      }
    }
    process.stdout.write('\n');
  }
  process.stdout.write('-------');
  process.stdout.write('\n');
  process.stdout.write('\n');

}

const drawRockAtPos = (rockShape, [y,x], roomHeight) => {
  const relativeRockPoints = getRelativeRockPoints(rockShape, [y,x]);

  for(let j = roomHeight; j>=0; j--) {
    for(let i = 0; i<CHAMBER_WIDTH; i++) {
      let foundAPoint = false;
      for(let [rY, rX] of relativeRockPoints) {
        if(rY ===j && rX ===i) {
          process.stdout.write('#');
          foundAPoint = true;
          break;
        }
      }
      if(!foundAPoint) {
        process.stdout.write('.');
      }
    }
    process.stdout.write('\n');
  }
  process.stdout.write('\n');
}

const rockCanBePlacedAtPos = (rockShape, [y,x], rockStack) => {
  const relativeRockPoints = getRelativeRockPoints(rockShape, [y,x]);
  for(let[rY,rX] of relativeRockPoints) {
    if(rX < 0 || rX > CHAMBER_WIDTH-1) return false;
    if(rY < 0) return false;

    if(rockStack.has(yxCoord([rY,rX]))) {
      return false;
    }
  }
  return true;
}

const placeRock = (rockShape, [y,x], rockStack) => {
  const relativeRockPoints = getRelativeRockPoints(rockShape, [y,x]);
  for(let[rY,rX] of relativeRockPoints) {
    rockStack.add(yxCoord([rY,rX]));
  }
}

const getFreeLevelY  = (rockStack) => {
  let maxY = -Infinity;
  if(rockStack.size === 0) return 0;
  for(let coord of rockStack.values()) {
    let [y,x] = coordYx(coord);
    if(y>= maxY) maxY = y;
  }
  return maxY+1;
}

const getRoomHeight = (rockStack) => {
  let maxY = -Infinity;
  if(rockStack.size === 0) return 0;
  for(let coord of rockStack.values()) {
    let [y,x] = coordYx(coord);
    if(y>= maxY) maxY = y;
  }
  return maxY+1;
}

const getRockHeight = (rockShape) => {
  let minY = Infinity;
  let maxY = -Infinity;
  for(let [y,x] of rockShape) {
    if(y < minY) minY = y;
    if(y > maxY) maxY = y;
  }
  return (maxY-minY)+1;
}

const findRoomHeightAfterNumBlocks = (inputData, numBlocks) => {

  let movements = inputData.split('');
  let numMovements = movements.length;
  let numRockShapes = rockShapes.length;
  let newRock = true;
  let rockNum = 0;
  let movementNum = 1;
  let rock;
  let xStartPos = 2;
  let x = 2; // Start pos
  let y = 4;
  let rockStack = new Set();

  while (true) {

    if (newRock) {
      rockNum++;
      rock = [...rockShapes[(rockNum-1) % numRockShapes]];
      newRock = false;
      const freeLevelY = getFreeLevelY(rockStack);
      y = freeLevelY+3; // Free space of 3
      x = xStartPos;
    }

    const thisMovement = movements[((movementNum-1) % numMovements)];
    movementNum++;

    let tryX = (thisMovement === '>') ? x+1 : x-1;
    let tryY = y;
    if(rockCanBePlacedAtPos(rock, [tryY, tryX], rockStack)) {
      x = tryX;
      y = tryY;
    }

    tryX = x;
    tryY = y-1;
    if(rockCanBePlacedAtPos(rock, [tryY, tryX], rockStack)) {
      x = tryX;
      y = tryY;
    } else {
      placeRock(rock, [y,x], rockStack);
      newRock = true;
      if (rockNum === (numBlocks)) break;
    }

  }
  return getFreeLevelY(rockStack);
};

// Part 1
const numRocks = 2022;
const roomHeight = findRoomHeightAfterNumBlocks(inputData, numRocks);
console.log(roomHeight);

// Part 2
const getBlocksAndHeightForOneInputCycle = (inputData) => {

  let movements = inputData.split('');
  let numMovements = movements.length;
  let numRockShapes = rockShapes.length;
  let newRock = true;
  let rockNum = 0;
  let movementNum = 1;
  let rock;
  let xStartPos = 2;
  let x = 2; // Start pos
  let y = 4;
  let rockStack = new Set();
  let movementCycle = 0;
  let movementStats = [];

  while (true) {

    if(movementNum> 1 && (movementNum) % numMovements === 0) {
      movementCycle++;
      movementStats.push({
        numRocks: rockNum,
        height: getFreeLevelY(rockStack),
      });
    }
    if(movementCycle===2) {
      return {
        blocksPerMovementCycle: movementStats[1].numRocks - movementStats[0].numRocks,
        heightPerMovementCycle: movementStats[1].height - movementStats[0].height,
      }
    }

    if (newRock) {
      rockNum++;
      rock = [...rockShapes[(rockNum-1) % numRockShapes]];
      newRock = false;
      const freeLevelY = getFreeLevelY(rockStack);
      y = freeLevelY+3; // Free space of 3
      x = xStartPos;
    }

    // Try movement
    const thisMovement = movements[((movementNum-1) % numMovements)];
    movementNum++;
    let tryX = (thisMovement === '>') ? x+1 : x-1;
    let tryY = y;
    if(rockCanBePlacedAtPos(rock, [tryY, tryX], rockStack)) {
      x = tryX;
      y = tryY;
    }

    tryX = x;
    tryY = y-1;
    if(rockCanBePlacedAtPos(rock, [tryY, tryX], rockStack)) {
      x = tryX;
      y = tryY;
    } else {
      placeRock(rock, [y,x], rockStack);
      newRock = true;
    }
  }
};

const findRoomHeightAfterHugeAmountOfBlocks = (inputData, numRocks) => {
  const {
    blocksPerMovementCycle,
    heightPerMovementCycle
  } = getBlocksAndHeightForOneInputCycle(inputData);

  const numberOfFullMovementCycles = Math.floor((numRocks)/blocksPerMovementCycle)-1;
  const heightAfterFullMovementCycles = numberOfFullMovementCycles*heightPerMovementCycle;
  const numberOfBlocksAfterFullMovementCycles = numberOfFullMovementCycles*blocksPerMovementCycle;

  const remainingBlocks = numRocks-numberOfBlocksAfterFullMovementCycles;
  const heightOfRemainingBlocks = findRoomHeightAfterNumBlocks(inputData, remainingBlocks);
  return heightAfterFullMovementCycles + heightOfRemainingBlocks;
};

const roomHeight2 = findRoomHeightAfterHugeAmountOfBlocks(inputData, 1000000000000);
console.log(roomHeight2);
