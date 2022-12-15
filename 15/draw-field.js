const fs = require('fs');
const sampleData = fs.readFileSync('sample.txt', 'utf8');

String.prototype.toInt = function () {
  return parseInt(this,10);
}

const distance = (a,b) => {
  return  Math.abs(b[0]-a[0]) + Math.abs(b[1]-a[1]);
};

function* getAllPositionCoveredBySensor([sX, sY], dist) {
  for(let j = 0; j<=dist; j++) {
    for(let i = j; i<=dist; i++) {
      // Bottom right
      yield [sX+dist-i,sY+j];

      // Bottom left
      yield [sX-dist+i,sY+j];

      /// Top right
      yield [sX+dist-i,sY-j];

      // Top left
      yield [sX-dist+i,sY-j];
    }
  }
}

const drawField = (input) => {
  let dim = {
    minX: Infinity,
    maxX: -Infinity,
    minY: Infinity,
    maxY: -Infinity
  }

  const allUnits = new Map();
  const addSensor = ([x,y]) => {
    allUnits.set(`${x}.${y}`, 'S');
  }
  const addBeacon = ([x,y]) => {
    allUnits.set(`${x}.${y}`, 'B');
  }
  const addCover = ([x,y]) => {
    if(! allUnits.has(`${x}.${y}`)) {
      allUnits.set(`${x}.${y}`, '#');

      if(x > dim.maxX) dim.maxX = x;
      if(x < dim.minX) dim.minX = x;
      if(y > dim.maxY) dim.maxY = y;
      if(y < dim.minY) dim.minY = y;
    }
  }
  const getItem = ([x,y]) => {
    return allUnits.get(`${x}.${y}`) ?? '.';
  }

  for(let line of input.split('\n')) {
    const coordinatesOnLine =  Array.from(line.matchAll(/[a-zA-Z]+=(-?[\d]+)/g)).map(
      (regExpMatchArray) => regExpMatchArray[1].toInt()
    );
    const s = [coordinatesOnLine[0],coordinatesOnLine[1]];
    const b = [coordinatesOnLine[2],coordinatesOnLine[3]];
    const d = distance(s,b);

    addSensor(s);
    addBeacon(b);

    for(let c of getAllPositionCoveredBySensor(s, d)) {
      addCover(c);
    }
  }
  for(let j = dim.minY; j<=dim.maxY; j++) {
    // process.stdout.write(`${j.toString(10).padStart(3)} `)
    for(let i = dim.minX; i<=dim.maxX; i++) {
      process.stdout.write( getItem([i,j]));
    }
    process.stdout.write(`\n`)
  }
}

drawField(sampleData);