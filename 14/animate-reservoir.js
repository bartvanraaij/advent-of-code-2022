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
  const addAndDrawRock = async (x,y) => {
    if(! _cave.has(`${x}.${y}`)) {
      _cave.set(`${x}.${y}`, '#');
      _allX.add(x); _allY.add(y);
      await display(x,y,'r');
    }
  }
  const getItem = (x, y) => {
    return _cave.get(`${x}.${y}`) ?? '.';
  }
  const addSand = (x,y) => {
    _cave.set(`${x}.${y}`, 'o');
    _allX.add(x); _allY.add(y);
  };

  const animate = async (input, animateDropping = false) => {
    _cave = new Map();
    _allX = new Set();
    _allY = new Set();
    _dimensions = null;
    console.clear();
    process.stdout.write('\u001B[?25l');//hide cursor

    const rockShapes = input.split('\n').map((line) => {
      return line.split(' -> ').map((coord) => coord.split(',').map((str) => parseInt(str, 10)));
    });

    for(let rockShape of rockShapes) {
      let r = 0;
      do {
        let [currentPointX, currentPointY] = rockShape[r];
        let [nextPointX, nextPointY] = rockShape[r+1];
        await addAndDrawRock(currentPointX, currentPointY);

        if(nextPointX > currentPointX) {
          for(let i=currentPointX; i<=nextPointX; i++) {
            await addAndDrawRock(i, currentPointY);
          }
        }
        if(nextPointX < currentPointX) {
          for(let i=currentPointX; i>=nextPointX; i--) {
            await addAndDrawRock(i, currentPointY);
          }
        }
        if(nextPointY > currentPointY) {
          for(let j=currentPointY; j<=nextPointY; j++) {
            await addAndDrawRock(currentPointX, j);
          }
        }
        if(nextPointY < currentPointY) {
          for(let j=currentPointY; j>=nextPointY; j--) {
            await addAndDrawRock(currentPointX, j);
          }
        }
        r++;
      } while(r < (rockShape.length-1));
    }
    await dropSand(animateDropping);
    await delay(2000);
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

  const findNextSandDropPlace = async (animated = false, startX = 500, startY = 0) => {
    // Find sand dropping position
    const {minX, maxX, maxY} = getDisplayDimensions();
    let currentX = startX;
    let currentY = startY;
    let endY = null;
    let endX = null;
    let prevX, prevY;
    do {
      if(animated) {
        if(prevX) {
          await display(prevX, prevY, ' ', 0);
        }
        await display(currentX, currentY, 'f');
      }
      prevX = currentX;
      prevY = currentY;
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

  const dropSand = async (animated) => {
    let numSand = 0;
    let tryNext = true;
    while(tryNext) {
      let [sandX, sandY] = await findNextSandDropPlace(animated);
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


  const display = async (x,y, item, d = 2) => {
    //
    // return { minX: 334, maxX: 667, minY: -3, maxY: 162 };
    process.stdout.cursorTo(x-334,y+3);
    if(item === 's') {
      process.stdout.write(`\x1b[1m\x1b[32mo\x1b[0m`);
    } else if (item === 'f') {
      process.stdout.write(`\x1b[1m\x1b[36mo\x1b[0m`);
    }  else if (item === 'r') {
      process.stdout.write(`\x1b[31m#\x1b[0m`);
    } else {
      process.stdout.write(` `);
    }
    await delay(d);
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

  return {animate};
}

// Part 1
const cave = buildCave();
const dim = { minX: 482, maxX: 556, minY: 13, maxY: 160 }
const input = rawData + `\n${dim.minX-148},${dim.maxY+2} -> ${dim.minX+185},${dim.maxY+2}`;

cave.animate(input, true);
