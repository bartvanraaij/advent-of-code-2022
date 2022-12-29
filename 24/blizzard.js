const fs = require('fs');
const sampleData = fs.readFileSync('sample.txt', 'utf8');
const inputData = fs.readFileSync('input.txt', 'utf8');

const yxCoord = ([y,x]) => `${y}.${x}`;
const coordYx = (coord) => coord.split(".").map((str) => parseInt(str, 10));

const directions = ['>','<','v','^', '='];

const moveCoord = ([cY, cX], direction, maxY, maxX) => {
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

  if (nY < 1) nY = maxY;// Wrap around bottom
  if (nY > maxY) nY = 1; // Wrap around top
  if (nX < 1) nX = maxX; // Wrap around right
  if (nX > maxX) nX = 1; // Wrap around left

  return [nY, nX];
}

const moveExpeditionCoord = ([cY, cX], direction, startPos, endPos, maxY, maxX) => {
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

  let notAllowed = (nY<1 || nY> maxY || nX <1 || nX > maxX);

  const [sY, sX] = startPos;
  const [eY, eX] = endPos;
  if((nY === sY && nX === sX)) notAllowed = false;
  if((nY===eY && nX===eX)) notAllowed = false;

  if(notAllowed) return false;

  return [nY, nX];
}

class Valley {
  width; height;
  _blizzardPositions;
  _expeditionPosition;
  _expeditionPositionYX;
  _expeditionStartPosition;
  _expeditionEndPosition;

  constructor(width, height, exStart, exEnd) {
    this.width = width;
    this.height = height;
    this._blizzardPositions = new Map();
    this._expeditionStartPosition = exStart;
    this._expeditionEndPosition = exEnd;
  }

  clone() {
    const newValley = new Valley(this.width, this.height, this._expeditionStartPosition, this._expeditionEndPosition);
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
        const newPos = moveCoord(coord, blizzard, this.height, this.width);
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

    let directionsToTry = directions;
    const [eY, eX] = this._expeditionPosition;
    const [sY, sX] = this._expeditionStartPosition;
    const [endY, endX] = this._expeditionEndPosition;
    if(eY === sY && eX===sX) {
      // Starting position
      directionsToTry = ['v', '='];
    }
    if(eY===endY && eX===endX) {
      // Ending position
      directionsToTry = ['^', '='];
    }

    for(let direction of directionsToTry) {
      const thisNewPos = moveExpeditionCoord(this._expeditionPosition, direction, this._expeditionStartPosition, this._expeditionEndPosition, this.height, this.width);
      if(thisNewPos && !this.positionHasBlizzard(thisNewPos)) {
        possibleMoves.push(thisNewPos);
      }
    }
    // Stay at the same place
    return possibleMoves;
  }
}

const parseInput = (inputData) => {
  const lines = inputData.split('\n');
  const valleyWidth = lines[0].length - 2;
  const valleyHeight = lines.length -2;
  const valley = new Valley(valleyWidth, valleyHeight, [0,1], [valleyHeight+1, valleyWidth]);

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
  endPositions;
  endPositionsYX;

  constructor(valley, currentMinute, expeditionPosition, endPositions, endPosNum = 1) {
    this.valley = valley.clone();
    this.currentMinute = currentMinute;
    this.valley.setExpeditionPosition(expeditionPosition);
    this.endPositions = endPositions;
    this.endPositionsYX = endPositions.map(yxCoord);
  }

  get expeditionPositionYX() {
    return this.valley.getExpeditionPositionYX();
  }

  toString() {
    return `${this.currentMinute}-${this.expeditionPositionYX}-${this.currentEndPosYX}`;
  }

  get currentEndPosYX() {
    return this.endPositionsYX[0];
  }

  getNextRuns() {
    const runsList = [];
    const val = this.valley.clone();
    val.moveBlizzards();
    const moveOpts = val.getExpeditionMoveOptions();
    const nextMinute = this.currentMinute+1;
    for(let moveToPosition of moveOpts) {
      runsList.push(new ValleyRun(val, nextMinute, moveToPosition, [...this.endPositions]));
    }
    return runsList;
  }
}

const getQuickestValleyPath = (valley, thereAndBackAgain = false) => {
  let currentQuickestPath = Infinity;
  let runs = [];
  let currentMinute = 0;

  const endPositions = thereAndBackAgain ? [
    valley._expeditionEndPosition,
    valley._expeditionStartPosition,
    valley._expeditionEndPosition,
  ] : [valley._expeditionEndPosition];

  // Starting state:
  runs.push(
    new ValleyRun(valley, currentMinute, valley._expeditionStartPosition, endPositions)
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
    // thisRun.valley.draw(thisRun.currentMinute);

    // console.log({r: thisRun.toString(), l: runs.length, c: currentQuickestPath});

    if(thisRun.currentMinute > currentQuickestPath) {
      continue;
    }

    if(thisRun.expeditionPositionYX === thisRun.currentEndPosYX) {
      thisRun.endPositions.shift();
      thisRun.endPositionsYX.shift();
      runs = [];

      if(thisRun.endPositions.length === 0) {
        // This is the real end
        return thisRun.currentMinute;
      }
    }

    // Next steps
    if(thisRun.endPositions.length > 0) {
      for (let nextRun of thisRun.getNextRuns()) {
        if (!willVisit.includes(nextRun.toString())) {
          runs.push(nextRun);
          willVisit.push(nextRun.toString());
        }
      }
    }

    runs.sort((a,b) => {
      return b.currentMinute - a.currentMinute;
    });

  } while (runs.length > 0);
}

const getQuickestValleyPathFromInputData = (inputData, cycleBack = false) => {
  const valley = parseInput(inputData);
  return getQuickestValleyPath(valley, cycleBack);
}

// Part 1
const quickestPathTroughValley = getQuickestValleyPathFromInputData(sampleData, false);
console.log(quickestPathTroughValley);

// Part 2
const quickestPathTroughValleyCycle = getQuickestValleyPathFromInputData(sampleData, true);
console.log(quickestPathTroughValleyCycle);

