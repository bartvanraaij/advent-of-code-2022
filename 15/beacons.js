const fs = require('fs');
const inputData = fs.readFileSync('input.txt', 'utf8');

String.prototype.toInt = function () {
  return parseInt(this,10);
}

const distance = (a,b) => {
  return Math.abs(b[0]-a[0]) + Math.abs(b[1]-a[1]);
};

const getRangeCoveredBySensorOnRow = ([sX, sY], range, row) => {
  const distanceToRow = Math.abs(row-sY);
  if(distanceToRow > range) {
    return null;
  }
  return [sX-(range-distanceToRow), sX+(range-distanceToRow)];
}

const countCoveredPositionsAtRow = (input, countAtRow) => {
  let minXOnRow = Infinity;
  let maxXOnRow = -Infinity;

  for(let line of input.split('\n')) {
    const coordinatesOnLine =  Array.from(line.matchAll(/[a-zA-Z]+=(-?[\d]+)/g)).map(
      (regExpMatchArray) => regExpMatchArray[1].toInt()
    );
    const sensor = [coordinatesOnLine[0],coordinatesOnLine[1]];
    const beacon = [coordinatesOnLine[2],coordinatesOnLine[3]];
    const range = distance(sensor, beacon);

    const coverRangeOnRow = getRangeCoveredBySensorOnRow(sensor, range, countAtRow);
    if(coverRangeOnRow) {
      if (coverRangeOnRow[0] < minXOnRow) minXOnRow = coverRangeOnRow[0];
      if (coverRangeOnRow[1] > maxXOnRow) maxXOnRow = coverRangeOnRow[1];
    }
  }

  return maxXOnRow - minXOnRow;
}

// Part 1
const coveredPositionsAtRowCount = countCoveredPositionsAtRow(inputData, 2000000);
console.log(coveredPositionsAtRowCount);

// Part 2
const positionIsCoveredBySensor = (sensorPosition, sensorRange, position) => {
  return distance(sensorPosition,position) <= sensorRange;
}

const getSensors = (input) => {
  const allSensors = new Set();
  for(let line of input.split('\n')) {
    const coordinatesOnLine =  Array.from(line.matchAll(/[a-zA-Z]+=(-?[\d]+)/g)).map(
      (regExpMatchArray) => regExpMatchArray[1].toInt()
    );
    const sensor = [coordinatesOnLine[0],coordinatesOnLine[1]];
    const beacon = [coordinatesOnLine[2],coordinatesOnLine[3]];
    const range = distance(sensor,beacon);

    allSensors.add({
      position: sensor,
      range
    });
  }
  return allSensors;
}

function* getAllPositionsJustOutsideSensorCover([sX, sY], range) {
  for(let j = range+1; j>=0; j--) {
    yield [sX-j+range+1,sY-j];
    yield [sX+j-range-1,sY-j];
    yield [sX+j-range-1,sY+j];
    yield [sX-j+range+1,sY+j];
  }
}

const positionIsCoveredByOtherSensor = (sensors, position) => {
  for(let sensor of sensors) {
    if(positionIsCoveredBySensor(sensor.position, sensor.range, position)) {
      return true;
    }
  }
  return false;
}

const findEmptySpot = (input, max) => {
  const sensors = getSensors(input);
  for(let sensor of sensors) {
    for(let p of getAllPositionsJustOutsideSensorCover(sensor.position, sensor.range)) {
      if(p[0] <= max && p[0] >= 0 && p[1] <= max && p[1]>=0) {
        if(! positionIsCoveredByOtherSensor(sensors, p)) {
          return p;
        }
      }
    }
  }
}

const availableSpot = findEmptySpot(inputData, 4000000);
const tuningFrequency = (availableSpot[0] * 4000000) + availableSpot[1];
console.log(tuningFrequency);
