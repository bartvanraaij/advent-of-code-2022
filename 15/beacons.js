const fs = require('fs');
const inputData = fs.readFileSync('input.txt', 'utf8');

String.prototype.toInt = function () {
  return parseInt(this,10);
}

const distance = (a,b) => {
  return  Math.abs(b[0]-a[0]) + Math.abs(b[1]-a[1]);
};

function getRangeCoveredBySensorOnRow([sX, sY], dist, row) {
  const distanceToRow = distance([sX,sY], [sX, row]);
  if(distanceToRow > dist) {
    return null;
  }
  return [sX-(dist-distanceToRow), sX+(dist-distanceToRow)];
}

const countCoveredPositionsAtRow = (input, countAtRow) => {
  let minXOnRow = Infinity;
  let maxXOnRow = -Infinity;

  for(let line of input.split('\n')) {
    const coordinatesOnLine =  Array.from(line.matchAll(/[a-zA-Z]+=(-?[\d]+)/g)).map(
      (regExpMatchArray) => regExpMatchArray[1].toInt()
    );
    const s = [coordinatesOnLine[0],coordinatesOnLine[1]];
    const b = [coordinatesOnLine[2],coordinatesOnLine[3]];
    const d = distance(s,b);

    let coverRangeOnRow = getRangeCoveredBySensorOnRow(s, d, countAtRow);
    if(coverRangeOnRow) {
      if (coverRangeOnRow[0] < minXOnRow) minXOnRow = coverRangeOnRow[0];
      if (coverRangeOnRow[1] > maxXOnRow) maxXOnRow = coverRangeOnRow[1];
    }
  }

  return maxXOnRow - minXOnRow;
}

// Part 1
const coveredPositionsAtRow = countCoveredPositionsAtRow(inputData, 2000000);
console.log(coveredPositionsAtRow);

// Part 2
function positionIsCoveredBySensor(s, p, dist) {
  return distance(s,p) <= dist;
}

const getSensors = (input) => {
  let allSensors = new Set();
  for(let line of input.split('\n')) {
    const coordinatesOnLine =  Array.from(line.matchAll(/[a-zA-Z]+=(-?[\d]+)/g)).map(
      (regExpMatchArray) => regExpMatchArray[1].toInt()
    );
    const s = [coordinatesOnLine[0],coordinatesOnLine[1]];
    const b = [coordinatesOnLine[2],coordinatesOnLine[3]];
    const d = distance(s,b);

    allSensors.add({
      position: s,
      range: d,
    });
  }
  return allSensors;
}

function* getAllPositionOutsideSensorCover([sX, sY], dist) {
  for(let j = dist+1; j>=0; j--) {
    yield [sX-j+dist+1,sY-j];
    yield [sX+j-dist-1,sY-j];
    yield [sX+j-dist-1,sY+j];
    yield [sX-j+dist+1,sY+j];
  }
}

function positionIsCoveredByOtherSensor(sensors, position) {
  for(let sensor of sensors) {
    if(positionIsCoveredBySensor(sensor.position, position, sensor.range)) {
      return true;
    }
  }
  return false;
}

const findEmptySpot = (input, max) => {
  const sensors = getSensors(input);

  for(let sensor of sensors) {
    for(let outside of getAllPositionOutsideSensorCover(sensor.position, sensor.range)) {
      if(outside[0] <= max && outside[0] >= 0 && outside[1] <= max && outside[1]>=0) {
        if(! positionIsCoveredByOtherSensor(sensors, outside)) {
          return outside;
        }
      }
    }
  }
}
const availableSpot = findEmptySpot(inputData, 4000000);
const tuningFrequency = (availableSpot[0] * 4000000) + availableSpot[1];
console.log(tuningFrequency);
