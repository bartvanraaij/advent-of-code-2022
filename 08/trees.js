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

// Setup forest
for(let y = 0; y < rows.length; y++) {
  const row = rows[y];
  for(let x = 0; x < row.length; x++) {
    const tree = row[x];
    setTree([x,y], tree);
  }
}

// Part 1
const isEdge = (x, y) => {
  return x===0 || x===highestX || y===0||y===highestY;
}

const compareTreesInRow = (startX, endX, y, compareWith) => {
  for(let i = startX; i<=endX; i++) {
    const compareTree = getTree(i,y);
    if(compareTree >= compareWith) return false;
  }
  return true;
}

const compareTreesInColumn = (startY, endY, x, compareWith) => {
  for(let j = startY; j<=endY; j++) {
    const compareTree = getTree(x,j);
    if(compareTree >= compareWith) return false;
  }
  return true;
}

const isVisible = (x,y, treeHeight) => {
  return (
    isEdge(x,y) ||
    compareTreesInColumn(y+1, highestY, x, treeHeight) ||
    compareTreesInColumn(0, y-1, x, treeHeight) ||
    compareTreesInRow(0, x-1, y, treeHeight) ||
    compareTreesInRow(x+1, highestX, y, treeHeight)
  );
}

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
const numVisibleTreesDownward = (x, y, vertical, compareWith) => {
  let count = 0, compareTree, i = vertical ? y : x;
  if(i===0) return 0;
  do {
    i--;
    count++;
    compareTree = vertical ? getTree(x, i) : getTree(i, y);
  } while(compareTree < compareWith && i > 0);
  return count;
}

const numVisibleTreesUpward = (x, y, vertical, compareWith) => {
  let count = 0, compareTree, i = vertical ? y : x;
  const highest = vertical ? highestY : highestX;
  if(i===highest) return 0;
  do {
    i++;
    count++;
    compareTree = vertical ? getTree(x, i) : getTree(i, y);
  } while(compareTree < compareWith && i < highest);
  return count;
}

let highestScore = 0;
for(let [coord, tree] of forest.entries()) {
  const [x,y] = coordToXY(coord);
  const l = numVisibleTreesDownward(x,y, false, tree);
  const r = numVisibleTreesUpward(x,y, false, tree);
  const t = numVisibleTreesDownward(x,y, true, tree);
  const b = numVisibleTreesUpward(x,y,true, tree);
  const score = l*r*t*b;
  if(score > highestScore) highestScore = score;
}
console.log(highestScore);