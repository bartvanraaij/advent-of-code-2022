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

const drawAllRocks = (activeRock, activeRockPos, roomHeight, rockStack) => {

  const activeRockRelativePointsStrs = getRelativeRockPoints(activeRock, activeRockPos).map(yxCoord);

  for(let j = roomHeight-1; j>=0; j--) {
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

const getRoomHeight = (rockStack) => {
  let maxY = -Infinity;
  for(let coord of rockStack.values()) {
    let [y,x] = coordYx(coord);
    if(y> maxY) maxY = y;
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
  let numRocks = rockShapes.length;
  let newRock = true;
  let rockNum = -1;
  let movementNum = 0;
  let rock;
  let roomHeight = 0;
  let xStartPos = 2;
  let x = 2; // Start pos
  let y = 4;
  let rockStack = new Set();

  while (true) {
    if (rockNum === numBlocks - 1) break;

    if (newRock) {
      // console.log('A new rock begins falling:');
      rockNum++;
      rock = [...rockShapes[rockNum % numRocks]];
      newRock = false;
      // A new rock starts on x=2 and y=4 above floor/currentHeight
      const rockHeight = getRockHeight(rock);
      roomHeight = roomHeight + rockHeight + 3;
      y = roomHeight-(rockHeight);
      x = xStartPos;
      // drawAllRocks(rock, [y, x], roomHeight, rockStack);
      continue;
    }

    // Try movement
    const thisMovement = movements[(movementNum % numMovements)];

    movementNum++;
    let tryX = (thisMovement === '>') ? x+1 : x-1;
    let tryY = y;
    if(rockCanBePlacedAtPos(rock, [tryY, tryX], rockStack)) {
      x = tryX;
      y = tryY;
    } else {
      // console.log(`Cannot perform movement ${thisMovement}`);
    }
    // drawAllRocks(rock, [y, x], roomHeight, rockStack);

    // Then one movement down
    tryX = x;
    tryY = y-1;
    // console.log(`Rock falls 1 unit`);
    if(rockCanBePlacedAtPos(rock, [tryY, tryX], rockStack)) {
      x = tryX;
      y = tryY;
    } else {
      // console.log('Cannot move down anymore, rock is stuck');
      placeRock(rock, [y,x], rockStack);
      newRock = true;
      roomHeight = getRoomHeight(rockStack);
    }

    // drawAllRocks(rock, [y, x], roomHeight, rockStack);
    // await delay(1000)
  }
  return roomHeight-3; // Minus the free space
};

// Part 1
const roomHeight = findRoomHeightAfterNumBlocks(inputData, 2022);
console.log(roomHeight);

