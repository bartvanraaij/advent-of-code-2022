const fs = require('fs');
const rawData = fs.readFileSync('input.txt', 'utf8');

const forest = new Map();
const setTree = ([x,y],value) => {
  return forest.set(`${x}.${y}`, parseInt(value, 10));
}
const coordToXY = (coord) => coord.split('.').map(str => parseInt(str, 10));
const getTree = (x,y) => {
  return forest.get(`${x}.${y}`);
}

const rows = rawData.split("\n");

const highestX = rows[0].length -1;
const highestY = rows.length -1;

const isEdge = (x, y) => {
  return x===0 || x===highestX || y===0||y===highestY;
}


const allTreesToTheLeftAreLower = (x,y, thisTree) => {
  return compareTreesInRow(0, x-1, y, thisTree);
}
const allTreesToTheRightAreLower = (x,y, thisTree) => {
  return compareTreesInRow(x+1, highestX, y, thisTree);
}

const allTreesAboveAreLower = (x,y, thisTree) => {
  return compareTreesInColumn(0, y-1, x, thisTree);
}

const allTreesBelowAreLower = (x,y, thisTree) => {
  return compareTreesInColumn(y+1, highestY, x, thisTree);
}

const compareTreesInRow = (startX, endX, y, compareWith) => {
  return compareTreesAmongAxis('x', startX, endX, y, compareWith);
}

const compareTreesInColumn = (startY, endY, x, compareWith) => {
  return compareTreesAmongAxis('y', startY, endY, x, compareWith);
}

const compareTreesAmongAxis = (axis, start, end, otherAxisValue, compareWith) => {
  for(let i = start; i<=end; i++) {
    const compareTree = axis === 'x' ? getTree(i,otherAxisValue) : getTree(otherAxisValue, i);
    if(compareTree >= compareWith) return false;
  }
  return true;
}

const numVisibleTreesToTheLeft = (x,y, thisTree) => {
  let count = 0;
  let compareTree;
  let i = x;
  if(x===0) return 0;
  do {
    i--;
    count++;
    compareTree = getTree(i, y);
  } while(compareTree < thisTree && i > 0);
  return count;
}
const numVisibleTreesToTheRight = (x,y, thisTree) => {
  let count = 0;
  let compareTree;
  let i = x;
  if(x === highestX) return 0;
  do {
    i++;
    count++;
    compareTree = getTree(i, y);
  } while(compareTree < thisTree && i<highestX);
  return count;
}

const numVisibleTreesToTheTop = (x,y, thisTree) => {
  let count = 0;
  let compareTree;
  let j = y;
  if(y===0) return 0;
  do {
    j--;
    count++;
    compareTree = getTree(x, j);
  } while(compareTree < thisTree && j > 0);
  return count;
}
const numVisibleTreesToTheBottom = (x,y, thisTree) => {
  let count = 0;
  let compareTree;
  let j = y;
  if(y === highestY) return 0;
  do {
    j++;
    count++;
    compareTree = getTree(x, j);
  } while(compareTree < thisTree && j<highestY);
  return count;
}




const isVisible = (x,y, treeHeight) => {
  if(isEdge(x,y)) {
    return true;
  }

  if(allTreesAboveAreLower(x,y, treeHeight) ||
    allTreesBelowAreLower(x,y, treeHeight) ||
    allTreesToTheRightAreLower(x,y, treeHeight) ||
    allTreesToTheLeftAreLower(x,y, treeHeight)
  ) {
    return true;
  }


  return false;
}


for(let y = 0; y < rows.length; y++) {
  const row = rows[y];
  for(let x = 0; x < row.length; x++) {
    const tree = row[x];
    setTree([x,y], tree);
  }
}

// Part 1
let visibleTreeCount = 0;
for(let [coord, tree] of forest.entries()) {
  const [x,y] = coordToXY(coord);
  const v = isVisible(x,y, tree);
  if(v) {
    visibleTreeCount++;
  }
}
console.log(visibleTreeCount);

// Part 2
let highestScore = 0;
for(let [coord, tree] of forest.entries()) {
  const [x,y] = coordToXY(coord);
  const l = numVisibleTreesToTheLeft(x,y,tree);
  const r = numVisibleTreesToTheRight(x,y,tree);
  const t = numVisibleTreesToTheTop(x,y,tree);
  const b = numVisibleTreesToTheBottom(x,y,tree);
  const score = l*r*t*b;
  if(score > highestScore) highestScore = score;
}
console.log(highestScore);