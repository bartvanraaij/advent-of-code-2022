const fs = require('fs');
const rawData = fs.readFileSync('input.txt', 'utf8');

const buildCave = () => {
  let _cave,_allX,_allY,_dimensions = null;

  const addRock = (x,y) => {
    _cave.set(`${x}.${y}`, '#');
    _allX.add(x); _allY.add(y);
  };
  const isEmpty = (x,y) => {
    return ! _cave.has(`${x}.${y}`);
  };
  const getItem = (x, y) => {
    return _cave.get(`${x}.${y}`) ?? '.';
  }
  const addSand = (x,y) => {
    _cave.set(`${x}.${y}`, 'o');
    _allX.add(x); _allY.add(y);
  };

  const setup = (input) => {
    _cave = new Map();
    _allX = new Set();
    _allY = new Set();
    _dimensions = null;

    const rockShapes = input.split('\n').map((line) => {
      return line.split(' -> ').map((coord) => coord.split(',').map((str) => parseInt(str, 10)));
    });

    for(let rockShape of rockShapes) {
      let r = 0;
      do {
        let [currentPointX, currentPointY] = rockShape[r];
        let [nextPointX, nextPointY] = rockShape[r+1];
        addRock(currentPointX, currentPointY);

        if(nextPointX > currentPointX) {
          for(let i=currentPointX; i<=nextPointX; i++) {
            addRock(i, currentPointY);
          }
        }
        if(nextPointX < currentPointX) {
          for(let i=currentPointX; i>=nextPointX; i--) {
            addRock(i, currentPointY);
          }
        }
        if(nextPointY > currentPointY) {
          for(let j=currentPointY; j<=nextPointY; j++) {
            addRock(currentPointX, j);
          }
        }
        if(nextPointY < currentPointY) {
          for(let j=currentPointY; j>=nextPointY; j--) {
            addRock(currentPointX, j);
          }
        }
        r++;
      } while(r < (rockShape.length-1));
    }
  }

  const getDimensions = () => {
    if(! _dimensions) {
      _dimensions = {
        minX: Math.min(..._allX),
        maxX: Math.max(..._allX),
        minY: Math.min(..._allY),
        maxY: Math.max(..._allY),
      };
    }
    return _dimensions;
  };

  const findNextSandDropPlace = (startX = 500, startY = 0) => {
    // Find sand dropping position
    const {minX, maxX, maxY} = getDimensions();
    let currentX = startX;
    let currentY = startY;
    let endY = null;
    let endX = null;
    do {
      if(! isEmpty(currentX, currentY+1) &&
        ! isEmpty(currentX-1, currentY+1) &&
        ! isEmpty(currentX+1, currentY+1)
      ) {
        // This position is empty for the sand to drop
        endX = currentX;
        endY = currentY;
      } else if (! isEmpty(currentX, currentY+1) &&
        isEmpty(currentX-1, currentY+1)
      ) {
        // Go left
        currentX--;
      } else if (! isEmpty(currentX, currentY+1) &&
        isEmpty(currentX+1, currentY+1)
      ) {
        // Go right
        currentX++;
      }
      else if(isEmpty(currentX, currentY+1)) {
        // Drop down 1 spot
        currentY++;
      }
    } while(endY === null && currentY <= maxY && endX === null && currentX >= minX && currentX <= maxX);

    return [endX, endY];
  }

  const dropSand = () => {
    let numSand = 0;
    let tryNext = true;
    while(tryNext) {
      let [sandX, sandY] = findNextSandDropPlace();
      if(sandX !== null && sandY !== null) {
        addSand(sandX, sandY);
        numSand++;
        if(sandX === 500 && sandY === 0) {
          tryNext = false;
        }
      } else {
        tryNext = false;
      }
    }
    return numSand;
  }

  const draw = () => {
    const dim = getDimensions();
    for(let j = dim.minY; j<=dim.maxY; j++) {
      for(let i = dim.minX; i <= dim.maxX; i++) {
        process.stdout.write(getItem(i,j));
      }
      process.stdout.write('\n');
    }
  }

  return {setup,dropSand,draw,getDimensions};
}

// Part 1
const cave = buildCave();
cave.setup(rawData);
const maxSand = cave.dropSand();
// cave.draw();
console.log(maxSand);

// Part 2
const dim = cave.getDimensions();
const input = rawData + `\n${dim.minX-200},${dim.maxY+2} -> ${dim.minX+200},${dim.maxY+2}`;
cave.setup(input);

const maxSandNow = cave.dropSand();
// cave.draw();
console.log(maxSandNow);
