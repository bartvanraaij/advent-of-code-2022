const fs = require('fs');
const rawData = fs.readFileSync('input.txt', 'utf8');

const toInt = (str) => parseInt(str, 10);


const addRock = (cave, x,y) => {
  return cave.set(`${x}.${y}`, '#');
};
const isEmpty = (cave, x,y) => {
  return ! cave.has(`${x}.${y}`);
};
const getItem = (cave, x, y) => {
  return cave.get(`${x}.${y}`) ?? '.';
}
const addSand = (cave, x,y) => {
  return cave.set(`${x}.${y}`, 'o');
};


const buildCave = (input) => {
  const rockShapes = input.split('\n').map((line) => {
    return line.split(' -> ').map((coord) => coord.split(',').map(toInt))
  });
  const allX = new Set();
  const allY = new Set();
  const cave = new Map();

  for(let rockShape of rockShapes) {
    // rockCoordinates.add(rockPoints[0]);
    let r = 0;
    do {
      let [currentPointX, currentPointY] = rockShape[r];
      let [nextPointX, nextPointY] = rockShape[r+1];

      if(nextPointX > currentPointX) {
        for(let i=currentPointX; i<=nextPointX; i++) {
          addRock(cave, i,currentPointY);
          allX.add(i);
        }
      }
      if(nextPointX < currentPointX) {
        for(let i=currentPointX; i>=nextPointX; i--) {
          addRock(cave, i,currentPointY);
          allX.add(i);
        }
      }
      if(nextPointY > currentPointY) {
        for(let j=currentPointY; j<=nextPointY; j++) {
          addRock(cave, currentPointX,j);
          allY.add(j);
        }
      }
      if(nextPointY < currentPointY) {
        for(let j=currentPointY; j>=nextPointY; j--) {
          addRock(cave, currentPointX,j);
          allY.add(j);
        }
      }
      r++;
    } while(r < (rockShape.length-1));
  }
  console.log(allX, allY);

  const meta = {
    minX: Math.min(...allX),
    maxX: Math.max(...allX),
    minY: Math.min(...allY),
    maxY: Math.max(...allY),
  }
  return {cave, meta};
}

const drawCave = (cave, startX = 494, endX = 503, startY = 0, endY = 9) => {
  for(let j = startY; j<=endY; j++) {
    for(let i = startX; i <= endX; i++) {
      process.stdout.write(getItem(cave, i,j));
    }
    process.stdout.write('\n');
  }
}

const findSandDropPlace = (cave, startX = 500, startY = 0, minX, maxX, maxY) => {
  // Find sand dropping position
  let currentX = startX;
  let currentY = startY;
  let endY = null;
  let endX = null;
  do {
    if(! isEmpty(cave, currentX, currentY+1) &&
      ! isEmpty(cave, currentX-1, currentY+1) &&
      ! isEmpty(cave, currentX+1, currentY+1)
    ) {
      endX = currentX;
      endY = currentY;
    } else if (! isEmpty(cave, currentX, currentY+1) &&
      isEmpty(cave, currentX-1, currentY+1)
    ) {
      currentX--;
    } else if (! isEmpty(cave, currentX, currentY+1) &&
      isEmpty(cave, currentX+1, currentY+1)
    ) {
      currentX++;
    }

    if(isEmpty(cave, currentX, currentY+1)) {
      // Drop down 1 spot
      currentY++;
    } else if(isEmpty(cave, currentX-1, currentY)) {
      // Go left
      currentX--;
    } else if(isEmpty(cave, currentX+1, currentY)) {
      // Go right
      currentX++;
    } else {
      endY = currentY;
      endX = currentX;
    }
  } while(endY === null && currentY <= maxY && endX === null && currentX >= minX && currentX<=maxX);

  return [endX, endY];
}


const {cave, meta} = buildCave(rawData);
let numSand = 0;
let tryNext = true;
while(tryNext) {
  let [sandX, sandY] = findSandDropPlace(cave, 500, 0, meta.minX, meta.maxX, meta.maxY);
  if(sandX !== null && sandY !== null) {
    addSand(cave, sandX, sandY);
    numSand ++;
  } else {
    tryNext = false;
  }
}

drawCave(cave, meta.minX, meta.maxX, meta.minY, meta.maxY);

// Part 1
console.log(numSand);
