const fs = require('fs');
const rawData = fs.readFileSync('input.txt', 'utf8');
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

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

  const setup = async (input) => {
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
        await display(currentPointX,currentPointY,'r');

        if(nextPointX > currentPointX) {
          for(let i=currentPointX; i<=nextPointX; i++) {
            addRock(i, currentPointY);
            await display(i,currentPointY,'r');
          }
        }
        if(nextPointX < currentPointX) {
          for(let i=currentPointX; i>=nextPointX; i--) {
            addRock(i, currentPointY);
            await display(i,currentPointY,'r');
          }
        }
        if(nextPointY > currentPointY) {
          for(let j=currentPointY; j<=nextPointY; j++) {
            addRock(currentPointX, j);
            await display(currentPointX,j,'r');
          }
        }
        if(nextPointY < currentPointY) {
          for(let j=currentPointY; j>=nextPointY; j--) {
            addRock(currentPointX, j);
            await display(currentPointX,j,'r');
          }
        }
        r++;
      } while(r < (rockShape.length-1));
    }
    dropSand();
  }

  const getPrimaryDimensions = () => {
    return { minX: 482, maxX: 556, minY: 13, maxY: 160 };
  }
  const getSecondaryDimensions = () => {
    return { minX: 482, maxX: 556, minY: 13, maxY: 160 };
  }

  const getDisplayDimensions = () => {
    return { minX: 334, maxX: 667, minY: 0, maxY: 162 };
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
    const {minX, maxX, maxY} = getDisplayDimensions();
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

  const dropSand = async () => {
    let numSand = 0;
    let tryNext = true;
    while(tryNext) {
      let [sandX, sandY] = findNextSandDropPlace();
      if(sandX !== null && sandY !== null) {
        addSand(sandX, sandY);
        await display(sandX, sandY, 's');
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


  const display = async (x,y, item) => {
    //
    // return { minX: 334, maxX: 667, minY: -3, maxY: 162 };
    process.stdout.cursorTo(x-334,y+3);
    if(item === 's') {
      process.stdout.write(`\x1b[1m\x1b[32mo\x1b[0m`);
    } else if (item === 'r') {
      process.stdout.write(`\x1b[31m#\x1b[0m`);
    }
    await delay(1);
  }


  const draw = () => {
    const dim = getDisplayDimensions();
    for(let j = dim.minY; j<=dim.maxY; j++) {
      for(let i = dim.minX; i <= dim.maxX; i++) {
        const item = getItem(i,j);

        if(item === 'o') {
          process.stdout.write(`\x1b[1m\x1b[32mo\x1b[0m`);

        } else if (item === '#') {
          process.stdout.write(`\x1b[31m#\x1b[0m`);

        } else {
          // process.stdout.write(`\x1b[37m${item}\x1b[0m`);
          process.stdout.write(` `);
        }      }
      process.stdout.write('\n');
    }
  }

  return {setup,dropSand,draw,getDimensions};
}

// Part 1
const cave = buildCave();
const dim = { minX: 482, maxX: 556, minY: 13, maxY: 160 }
const input = rawData + `\n${dim.minX-148},${dim.maxY+2} -> ${dim.minX+185},${dim.maxY+2}`;
console.clear();
process.stdout.write('\u001B[?25l');//hide cursor
cave.setup(input);
