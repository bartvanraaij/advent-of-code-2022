const fs = require('fs');
const sampleData = fs.readFileSync('sample.txt', 'utf8');
const inputData = fs.readFileSync('input.txt', 'utf8');

const yxCoord = ([y,x]) => `${y.toString(10)}.${x.toString(10)}`;

class Elf {
  currentPosition;
  proposedNewPosition;
  canMove;
  constructor( currentPosition) {
    this.currentPosition = currentPosition;
    this.proposedNewPosition = null;
  }

  moveToProposedNewPosition() {
    if(this.proposedNewPosition) {
      this.currentPosition = [...this.proposedNewPosition];
      this.proposedNewPosition = null;
      this.canMove = false
    }
  }

}

class Troupe {
  elves;
  directionOrder;

  allOccupiedPositions;
  allOccupiedPositionsPositionsYX;
  allDuplicateProposedPositionsYX;

  constructor() {
    this.elves = new Set();
    this.directionOrder = ['n','s','w','e'];
  }

  captureAllOccupiedPositions() {
    const elves = [...this.elves.values()];
    this.allOccupiedPositions = elves.map(elf => elf.currentPosition);
    this.allOccupiedPositionsPositionsYX = this.allOccupiedPositions.map(yxCoord);
  }
  captureDuplicateProposals() {
    const allProposedPositions = [...this.elves.values()]
      .filter(e => e.proposedNewPosition!==null)
      .map(elf => yxCoord(elf.proposedNewPosition)).sort(); // You can define the comparing function here.

    let duplicates = [];
    for (let i = 0; i < allProposedPositions.length - 1; i++) {
      if (allProposedPositions[i + 1] === allProposedPositions[i]) {
        duplicates.push(allProposedPositions[i]);
      }
    }
    this.allDuplicateProposedPositionsYX = duplicates;
  }
  addElf(elf) {
    this.elves.add(elf);
  }
  getOccupiedPositions() {
    return this.allOccupiedPositions;
  }
  positionIsOccupied(coord) {
    return this.allOccupiedPositionsPositionsYX.includes(yxCoord(coord));
  }

  allSurroundingPositionsInDirectionAreFree([y,x], direction) {
    if(direction === 'n') {
      if(this.positionIsOccupied([y-1, x-1])) return false;
      if(this.positionIsOccupied([y-1, x])) return false;
      if(this.positionIsOccupied([y-1, x+1])) return false;
    }
    if(direction === 's') {
      if(this.positionIsOccupied([y+1, x-1])) return false;
      if(this.positionIsOccupied([y+1, x])) return false;
      if(this.positionIsOccupied([y+1, x+1])) return false;
    }
    if(direction === 'w') {
      if(this.positionIsOccupied([y-1, x-1])) return false;
      if(this.positionIsOccupied([y, x-1])) return false;
      if(this.positionIsOccupied([y+1, x-1])) return false;
    }
    if(direction === 'e') {
      if(this.positionIsOccupied([y-1, x+1])) return false;
      if(this.positionIsOccupied([y, x+1])) return false;
      if(this.positionIsOccupied([y+1, x+1])) return false;
    }
    return true;
  }
  allSurroundingPositionsAreFree([y,x]) {
    if(this.positionIsOccupied([y-1, x-1])) return false;
    if(this.positionIsOccupied([y-1, x])) return false;
    if(this.positionIsOccupied([y-1, x+1])) return false;
    if(this.positionIsOccupied([y, x-1])) return false;
    if(this.positionIsOccupied([y, x+1])) return false;
    if(this.positionIsOccupied([y+1, x-1])) return false;
    if(this.positionIsOccupied([y+1, x])) return false;
    if(this.positionIsOccupied([y+1, x+1])) return false;
    return true;
  }

  askElvesToProposeNewPosition() {
    // First half
    for(let elf of this.elves) {
      if(this.allSurroundingPositionsAreFree(elf.currentPosition)) {
        elf.proposedNewPosition = null; // Do nothing
        elf.canMove = false;
      }
      else {
        elf.proposedNewPosition = null; // Do nothing
        elf.canMove = false;
        for(let direction of this.directionOrder) {
          if(this.allSurroundingPositionsInDirectionAreFree(elf.currentPosition, direction)) {
            const [cY,cX] = elf.currentPosition;
            if(direction === 'n') elf.proposedNewPosition = [cY-1,cX];
            if(direction === 'e') elf.proposedNewPosition = [cY,cX+1];
            if(direction === 's') elf.proposedNewPosition = [cY+1,cX];
            if(direction === 'w') elf.proposedNewPosition = [cY,cX-1];
            break;
          }
        }
      }
    }
  }

  getElves() {
    return this.elves.values();
  }

  elfCanMove(elf) {
    if(elf.proposedNewPosition === null) return false;
    const wantedCoord = yxCoord(elf.proposedNewPosition);
    return !this.allDuplicateProposedPositionsYX.includes(wantedCoord);
  }

  moveElves() {
    for(let elf of this.elves.values()) {
      if(elf.proposedNewPosition !== null && elf.canMove) {
        elf.moveToProposedNewPosition();
      }
    }
  }


  moveDirectionOrder() {
    const removed = this.directionOrder.shift();
    this.directionOrder.push(removed);
  }

  countFreeSquares() {
    const allPositions = this.getOccupiedPositions();
    const allY = allPositions.map(([y,x]) => y);
    const allX = allPositions.map(([y,x]) => x);
    const lowestY = Math.min(...allY);
    const highestY = Math.max(...allY);
    const lowestX = Math.min(...allX);
    const highestX = Math.max(...allX);
    const numElves = this.elves.size;
    const areaWidth = Math.abs(lowestX - highestX)+1;
    const areaHeight = Math.abs(lowestY - highestY) +1;
    const areaSurface = areaWidth*areaHeight;
    return areaSurface-numElves;
  }

  drawMap() {
    const allPositions = this.getOccupiedPositions();
    const allPositionStrings = allPositions.map(yxCoord);
    const allY = allPositions.map(([y,x]) => y);
    const allX = allPositions.map(([y,x]) => x);
    const lowestY = Math.min(...allY);
    const highestY = Math.max(...allY);
    const lowestX = Math.min(...allX);
    const highestX = Math.max(...allX);

    process.stdout.write('------------\n');
    for(let j = lowestY; j<=highestY; j++) {
      for(let i = lowestX; i<=highestX; i++) {
        // process.stdout.cursorTo(i, y);
        // process.stdout.write(grid[y][x]);
        if(allPositionStrings.includes(yxCoord([j,i]))) {
          process.stdout.write('#');
        } else {
          process.stdout.write('.');
        }

      }
      process.stdout.write('\n');
    }
  }

}

const parseInput = (inputData) => {
  const troupe = new Troupe();
  const lines = inputData.split('\n');
  let e = 0;
  for (let y = 0; y<lines.length; y++) {
    const line = lines[y];
    for(let x = 0; x<line.length; x++) {
      if(line[x] === '#') {
        const elf = new Elf([y,x]);
        e++;
        troupe.addElf(elf);
      }
    }
  }
  troupe.captureAllOccupiedPositions();
  return troupe;
}

// Part 1
const countRemainingEmptySquaresAfterRounds = (inputData, numRounds = 10) => {
  const troupe = parseInput(inputData);
  for(let i = 1; i<=numRounds; i++) {

    troupe.askElvesToProposeNewPosition();

    troupe.captureDuplicateProposals();

    let c = 0;
    for(let elf of troupe.getElves()) {
      if(troupe.elfCanMove(elf)) {
        elf.canMove = true;
        c++;
      } else {
        elf.canMove = false;
      }
    }

    console.log(`Round ${i}, moving ${c} elves`);

    troupe.moveElves();
    troupe.moveDirectionOrder();
  }

  return troupe.countFreeSquares();
}

// Part 1
const numEmptySquares = countRemainingEmptySquaresAfterRounds(inputData);
console.log(numEmptySquares);

// Part 2
const getRoundWhereNoElfMoves = (inputData) => {
  const troupe = parseInput(inputData);
  let round = 1;
  while (true) {

    troupe.askElvesToProposeNewPosition();
    troupe.captureDuplicateProposals();

    let movingElfCount = 0;

    const elves = [...troupe.getElves()];
    for(let elf of elves) {
      if(elf.proposedNewPosition && troupe.elfCanMove(elf)) {
        elf.canMove = true;
        movingElfCount++;
      } else {
        elf.canMove = false;
      }
    }

    troupe.moveElves();
    troupe.captureAllOccupiedPositions();
    troupe.moveDirectionOrder();

    console.log(`Round ${round}, ${movingElfCount} elves moved`);

    if(movingElfCount === 0) {
      return round;
    }

    round ++;
  }
}
const roundWhereNoElfMoves = getRoundWhereNoElfMoves(inputData);
console.log(roundWhereNoElfMoves);


