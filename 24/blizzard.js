const fs = require('fs');
const sampleData = fs.readFileSync('sample.txt', 'utf8');
const inputData = fs.readFileSync('input.txt', 'utf8');

const yxCoord = ([y,x]) => `${y}.${x}`;
const coordYx = (coord) => coord.split(".").map((str) => parseInt(str, 10));

const directions = ['>','<','v','^', '='];

const moveCoord = ([cY, cX], direction, allowWrap = true, maxY, maxX) => {
  let nY, nX;
  if(direction === '>')  {
    nY = cY;
    nX = cX+1;
  }
  if(direction === '<')  {
    nY = cY;
    nX = cX-1;
  }
  if(direction === 'v')  {
    nY = cY+1;
    nX = cX;
  }
  if(direction === '^')  {
    nY = cY-1;
    nX = cX;
  }
  if(direction === '=')  {
    nY = cY;
    nX = cX;
  }

  if(!allowWrap && (nY<1 || nY> maxY || nX <1 || nX > maxX)) {
    return false;
  }
  if(nY < 1) nY = maxY;// Wrap around bottom
  if(nY > maxY) nY = 1; // Wrap around top
  if(nX < 1) nX = maxX; // Wrap around right
  if(nX > maxX) nX = 1; // Wrap around left

  return [nY, nX];
}

class Valley {
  width; height;
  _blizzardPositions;
  _expeditionPosition;
  _expeditionPositionYX;

  constructor(width, height) {
    this.width = width;
    this.height = height;
    this._blizzardPositions = new Map();
  }

  clone() {
    const newValley = new Valley(this.width, this.height);
    newValley._blizzardPositions = new Map(this._blizzardPositions.entries());
    newValley._expeditionPosition = this._expeditionPosition;
    newValley._expeditionPositionYX = this._expeditionPositionYX;
    return newValley;
  }

  addBlizzardAtPosition(position, direction) {
    const yx = yxCoord(position);
    if(this._blizzardPositions.has(yx)) {
      const curr = this._blizzardPositions.get(yx);
      curr.push(direction);
    } else {
      this._blizzardPositions.set(yx, [direction]);
    }
  }

  positionHasBlizzard(position) {
    const posYX = yxCoord(position);
    return this._blizzardPositions.has(posYX);
  }

  positionIsFree(position) {
    return ! this.positionHasBlizzard(position);
  }

  positionDesignation(position) {
    const posYX = yxCoord(position);
    if(this._expeditionPositionYX === posYX) {
      return 'E';
    }
    if(! this._blizzardPositions.has(posYX)) {
      return '.';
    }

    const blizzards = this._blizzardPositions.get(posYX);
    if(blizzards.length > 1) return blizzards.length.toString(10);
    else return blizzards[0];
  }

  get blizzards() {
    return [...this._blizzardPositions.values()].flat();
  }

  moveBlizzards() {
    const curr = this._blizzardPositions;
    this._blizzardPositions = new Map();
    for(let [yx, blizzards] of curr) {
      const coord = coordYx(yx);
      for(let blizzard of blizzards) {
        const newPos = moveCoord(coord, blizzard, true, this.height, this.width);
        this.addBlizzardAtPosition(newPos, blizzard);
      }
    }
  }

  draw(title = '') {
    if(title)  process.stdout.write(`--- ${title} ---\n`);
    for(let j=1; j<=this.height; j++) {
      for(let i =1; i<=this.width; i++) {
        process.stdout.write(this.positionDesignation([j,i]));
      }
      process.stdout.write('\n');
    }
    process.stdout.write('\n\n');
  }

  setExpeditionPosition(position) {
    this._expeditionPosition = position;
    this._expeditionPositionYX = yxCoord(position);
  }

  getExpeditionPositionYX() {
    return this._expeditionPositionYX;
  }

  getExpeditionMoveOptions() {
    const possibleMoves = [];
    const possibleDirections = [];
    for(let direction of directions) {
      const thisNewPos = moveCoord(this._expeditionPosition, direction, false, this.height, this.width);
      if(thisNewPos && !this.positionHasBlizzard(thisNewPos)) {
        possibleMoves.push(thisNewPos);
        possibleDirections.push(direction);
      }
    }
    // Stay at the same place
    return [possibleMoves, possibleDirections];
  }
}

const parseInput = (inputData) => {
  const lines = inputData.split('\n');
  const valleyWidth = lines[0].length - 2;
  const valleyHeight = lines.length -2;
  const valley = new Valley(valleyWidth, valleyHeight);

  for(let j = 1; j<=valleyHeight; j++) {
    for(let i=1; i<=valleyWidth; i++) {
      const char = lines[j].charAt(i);
      if(char !== '.') {
        valley.addBlizzardAtPosition([j,i], char);
      }
    }
  }

  return valley;


};

class ValleyRun {
  valley;
  currentMinute;

  constructor(valley, currentMinute, expeditionPosition) {
    this.valley = valley.clone();
    this.currentMinute = currentMinute;
    this.valley.setExpeditionPosition(expeditionPosition);
  }

  get expeditionPositionYX() {
    return this.valley.getExpeditionPositionYX();
  }

  toString() {
    return `${this.currentMinute}-${this.expeditionPositionYX}`;
  }

  getNextRuns() {
    const runsList = [];
    const val = this.valley.clone();
    val.moveBlizzards();
    const [moveOpts, moveDirs] = val.getExpeditionMoveOptions();
    const nextMinute = this.currentMinute+1;
    for(let moveToPosition of moveOpts) {
      runsList.push(new ValleyRun(val, nextMinute, moveToPosition));
    }

    return runsList;

  }
}

const getQuickestValleyPath = (valley, startPosition, endPosition) => {
  let currentQuickestPath = Infinity;
  const runs = [];
  const endPositionYX = yxCoord(endPosition);
  let currentMinute = 0;
  let startingPositionAvailable = false;
  while(true) {
    startingPositionAvailable = valley.positionIsFree(startPosition);
    if(startingPositionAvailable) {
      break;
    }
    currentMinute++;
    valley.moveBlizzards();
  }

  // console.log('Starting position found at minute', currentMinute);
  // Starting state:
  runs.push(
    new ValleyRun(valley, currentMinute, startPosition)
  );
  const visited = [];
  const willVisit = [];

  do {
    const thisRun = runs.pop();

    if(visited.includes(thisRun.toString())) {
      // We already have this run, it will have the same results
      continue;
    }
    visited.push(thisRun.toString());

    // console.log({m: thisRun.currentMinute, p: thisRun.expeditionPositionYX,  l: runs.length, c: currentQuickestPath});

    if(thisRun.currentMinute > currentQuickestPath) {
      continue;
    }

    if(thisRun.expeditionPositionYX === endPositionYX) {
      if(thisRun.currentMinute < currentQuickestPath) {
        currentQuickestPath = thisRun.currentMinute;
      }
    }

    // Next steps
    for(let nextRun of thisRun.getNextRuns()) {
      if(!willVisit.includes(nextRun.toString())) {
        runs.push(nextRun);
        willVisit.push(nextRun.toString());
      }
    }

    runs.sort((a,b) => {
      return b.currentMinute - a.currentMinute;
    });

  } while (runs.length > 0);

  // Add one more minute for the final step
  return currentQuickestPath+1;
}

const getQuickestValleyPathFromInputData = (inputData) => {
  const valley = parseInput(inputData);
  return getQuickestValleyPath(valley, [1,1], [valley.height, valley.width]);
}

// Part 1
const quickestPathTroughValley = getQuickestValleyPathFromInputData(inputData);
console.log(quickestPathTroughValley);
