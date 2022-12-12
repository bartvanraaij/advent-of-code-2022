const fs = require('fs');
const rawData = fs.readFileSync('input.txt', 'utf8');

const buildHillAdjacencyList = (input) => {

  const getHeight = (char) => {
    if(! char) return -1;
    if(char === 'S') return 0;
    if(char === 'E') return 25;
    return 'abcdefghijklmnopqrstuvwxyz'.indexOf(char);
  }

  const isPossibleMove = (currHeight, destHeight) => {
    return destHeight !== -1 && destHeight <= (currHeight+1);
  }

  const neighborFns = [
    (x,y) => [x-1, y],
    (x,y) => [x+1, y],
    (x,y) => [x, y-1],
    (x,y) => [x, y+1],
  ];

  const list = {};
  const rows = input.split('\n');
  for(let y=0; y < rows.length; y++) {
    for(let x=0; x < rows[y].length; x++) {
      const char = rows[y].charAt(x);
      const height = getHeight(char);
      list[`${x}.${y}`] = [];
      for (let neighborFn of neighborFns) {
        let [neighborX, neighborY] = neighborFn(x, y);
        const neighborChar = rows[neighborY]?.charAt(neighborX);
        const neighborHeight = getHeight(neighborChar);
        if(isPossibleMove(height, neighborHeight)) {
          list[`${x}.${y}`].push(`${neighborX}.${neighborY}`);
        }
      }
    }
  }
  return list;
}

const findSquareCoordinates = (input, findChar) => {
  const rows = input.split('\n');
  for(let y=0; y < rows.length; y++) {
    for(let x=0; x < rows[y].length; x++) {
      const char = rows[y].charAt(x);
      if(char === findChar) return `${x}.${y}`;
    }
  }
}

const breadthFirstSearch = function (adjacencyList, startSquare, endSquare) {
  const queue = [
    startSquare
  ];
  const visited = new Set([startSquare]);
  const distances = new Map([[startSquare,0]]);

  while (queue.length > 0) {
    const square = queue.shift();
    const adjacentSquares = adjacencyList[square] ?? [];
    for (let visitingSquare of adjacentSquares) {
      if (!visited.has(visitingSquare)) {
        distances.set(visitingSquare, distances.get(square) +1);
        visited.add(visitingSquare);
        queue.push(visitingSquare);
      }
    }
  }
  return distances.get(endSquare);
}

// Part 1
const startSquare = findSquareCoordinates(rawData, 'S');
const endSquare = findSquareCoordinates(rawData, 'E');
const hillList = buildHillAdjacencyList(rawData);
const distanceStartToEnd = breadthFirstSearch(hillList, startSquare, endSquare);
console.log(distanceStartToEnd);

// Part 2
const findAllStartSquares = (input) => {
  const startingSquareCoords = [];
  const rows = input.split('\n');
  for(let y=0; y < rows.length; y++) {
    for(let x=0; x < rows[y].length; x++) {
      const char = rows[y].charAt(x);
      if(char === 'a' || char === 'S') {
        startingSquareCoords.push(`${x}.${y}`);
      }
    }
  }
  return startingSquareCoords;
}

let startingSquares = findAllStartSquares(rawData);
let shortestDistance = Infinity;
for(let startingSquare of startingSquares) {
  const distanceStartToEnd = breadthFirstSearch(hillList, startingSquare, endSquare);
  if(distanceStartToEnd && distanceStartToEnd < shortestDistance) shortestDistance = distanceStartToEnd;
}

console.log(shortestDistance);
