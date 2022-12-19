const fs = require('fs');
const sampleData = fs.readFileSync('sample.txt', 'utf8');
const inputData = fs.readFileSync('input.txt', 'utf8');

String.prototype.toInt = function () {
  return parseInt(this,10);
}

const getCubes = (input) => {
  return input.split("\n").map(line => line.split(",").map((str) => str.toInt()));
};

const getAmountOfFreeSides = ([x,y,z], cubes) => {
  let freeSides = 6;
  let leftFree = true;
  let rightFree = true;
  let topFree = true;
  let bottomFree = true;
  let frontFree = true;
  let backFree = true;
  for(let [cX,cY,cZ] of cubes) {
    if(!leftFree && !rightFree &&!topFree && !bottomFree &&!frontFree &&!backFree) break;
    if(x===cX&&y===cY&&z===cZ) continue;
    if(leftFree && cZ === z && cY===y && cX ===x-1) leftFree = false;
    if(rightFree && cZ === z && cY===y && cX ===x+1) rightFree = false;
    if(backFree && cX === x && cY===y && cZ ===z+1) backFree = false;
    if(frontFree && cX === x && cY===y && cZ ===z-1) frontFree = false;
    if(topFree && cX === x && cZ===z && cY ===y+1) topFree = false;
    if(bottomFree && cX === x && cZ===z && cY ===y-1) bottomFree = false;
  }
  if(!leftFree) freeSides--;
  if(!rightFree) freeSides--;
  if(!topFree) freeSides--;
  if(!bottomFree) freeSides--;
  if(!frontFree) freeSides--;
  if(!backFree) freeSides--;
  return freeSides;
};


// Part 1
const countAllFreeSides = (inputData) => {
  const cubes = getCubes(inputData);
  return cubes.reduce((acc, cube) => {
    return getAmountOfFreeSides(cube, cubes) + acc;
  }, 0);
}
const surfaceArea = countAllFreeSides(inputData);
console.log(surfaceArea);

// Part 2
// Find the grid size
const getGridSize = (cubes) => {
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity, minZ = Infinity, maxZ = -Infinity;
  for(let [x,y,z] of cubes) {
    if(x < minX) minX = x;
    if(x > maxX) maxX = x;
    if(y < minY) minY = y;
    if(y > maxY) maxY = y;
    if(z < minZ) minZ = z;
    if(z > maxZ) maxZ = z;
  }
  return {minX,maxX,minY,maxY,minZ,maxZ};
}

const xyzKey = ([x,y,z]) =>  `${x}.${y}.${z}`;

const build3dGrid = (cubes) => {
  let grid = [];
  const emptySpots = [];
  const gridSize = getGridSize(cubes);
  const cubeStrings = new Set(cubes.map(xyzKey));
  for(let i=0; i<=gridSize.maxX; i++) {
    const thisX = [];
    for(let j=0; j<=gridSize.maxY; j++) {
      const thisY = [];
      for(let k=0; k<=gridSize.maxZ; k++) {
        if(cubeStrings.has(xyzKey([i,j,k]))) {
          thisY.push('C')
        } else {
          thisY.push('E');
          emptySpots.push([i,j,k]);
        }
      }
      thisX.push(thisY);
    }
    grid.push(thisX);
  }
  return {gridSize,grid, emptySpots};
}

const directions = ['left','right','top','bottom','front','back'];
const getAdjacentCoords = ([x,y,z], dir) => {
  if(dir === 'left') return [x-1,y,z];
  if(dir === 'right') return [x+1, y,z];
  if(dir === 'top') return [x,y+1,z];
  if(dir === 'bottom') return [x,y-1,z];
  if(dir === 'front') return[x,y,z-1];
  if(dir === 'back') return [x,y,z+1];
};

const isOnGridEdge = ([x,y,z], gridSize) => {
  return (x >= gridSize.maxX || x <= gridSize.minX ||
    y >= gridSize.maxY || y <= gridSize.minY ||
    z >= gridSize.maxZ ||z <= gridSize.minZ);
}

const isCube = ([x,y,z], grid) => {
  return grid[x][y][z] === 'C';
}

const hasAWayOut = (position, grid, gridSize, visited = [], trapped, notTrapped) => {

  let thisPos = xyzKey(position);

  if(trapped.has(thisPos)) {
    return false;
  }

  if(notTrapped.has(thisPos)) {
    return true;
  }

  if(visited.includes(thisPos)) {
    return false;
  } // Loop!
  visited.push(thisPos);

  if(isOnGridEdge(position, gridSize)) {
    let thisIsBlocked = isCube(position, grid);
    if(thisIsBlocked) {
      trapped.add(thisIsBlocked);
      return false;
    }
    else {
      notTrapped.add(thisIsBlocked);
      return true;
    }
  }
  for(let direction of directions) {
    let look = getAdjacentCoords(position, direction);

    if(isCube(look, grid)) {
      visited.push(xyzKey(look));
      continue;
    }

    let thisLookWayIsAWayOut = hasAWayOut(look, grid, gridSize, [...visited], trapped, notTrapped);
    if(thisLookWayIsAWayOut) {
      return true;
    }
  }

  trapped.add(thisPos);
  return false;
}

const countAllFreeSidesWithTrappedSpotsAdded = (inputData) => {
  const cubes = getCubes(inputData);
  const {gridSize,grid, emptySpots} = build3dGrid(cubes);

  const trapped = new Set();
  const notTrapped = new Set();
  const trappedEmptySpots = emptySpots.filter(s => ! hasAWayOut(s, grid, gridSize, [], trapped, notTrapped));

  const cubesAndTrappedEmptySpots = [...cubes,...trappedEmptySpots];
  return cubes.reduce((acc, cube) => {
    return getAmountOfFreeSides(cube, cubesAndTrappedEmptySpots) + acc;
  }, 0);
}

// Part 2
const exteriorSurfaceArea = countAllFreeSidesWithTrappedSpotsAdded(inputData);
console.log(exteriorSurfaceArea);
