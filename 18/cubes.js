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
const cubes = getCubes(inputData);
const allFreeSides = cubes.reduce((acc, cube) => {
  return getAmountOfFreeSides(cube, cubes) + acc;
}, 0);
console.log(allFreeSides);
