const fs = require('fs');

const rawData = fs.readFileSync('input.txt', 'utf8');

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

const instructions = rawData.split("\n").map((str) => {
  let [dir,num] = str.split(' ');
  return { dir, steps: parseInt(num, 10) }
});

const numInstructions = instructions.length;

const determineNewPosition = (pos, dir) => {
  if(dir === 'R') {
    return { x: pos.x+1, y: pos.y };
  }
  if(dir === 'U') {
    return { x: pos.x, y: pos.y+1 };
  }
  if(dir === 'L') {
    return { x: pos.x-1, y: pos.y };
  }
  if(dir === 'D') {
    return { x: pos.x, y: pos.y-1 };
  }
  if(dir === 'RU') {
    return { x: pos.x+1, y: pos.y+1 };
  }
  if(dir === 'RD') {
    return { x: pos.x+1, y: pos.y-1 };
  }
  if(dir === 'LU') {
    return { x: pos.x-1, y: pos.y+1 };
  }
  if(dir === 'LD') {
    return { x: pos.x-1, y: pos.y-1 };
  }
}

const determineNewKnotPosition = (hp, tp) => {
  if(hp.x === tp.x && hp.y === tp.y) {
    // Overlapping, do nothing
    return tp;
  }
  let diffX = Math.abs(hp.x - tp.x);
  let diffY = Math.abs(hp.y - tp.y);
  if(diffX <= 1 && diffY <= 1) {
    // Adjacent, do nothing
    return tp;
  }

  if(hp.x > tp.x && hp.y === tp.y) {
    // Head is to the right move along the same direction
    return determineNewPosition(tp, 'R');
  }
  if(hp.x !== tp.x && hp.y === tp.y) {
    // Head is to the right or left, move along the same direction
    return determineNewPosition(tp, hp.x > tp.x ? 'R':'L');
  }
  if(hp.x === tp.x && hp.y !== tp.y) {
    // Head is to the top or bottom, move along the same direction
    return determineNewPosition(tp, hp.y > tp.y ? 'U':'D');
  }
  if(hp.x > tp.x && hp.y > tp.y) {
    // Head is to top right, move tail right up diagonally
    return determineNewPosition(tp, 'RU');
  }
  if(hp.x < tp.x && hp.y > tp.y) {
    // Head is to top left, move tail left up
    return determineNewPosition(tp, 'LU');
  }
  if(hp.x > tp.x && hp.y < tp.y) {
    // Head is to bottom right, move tail right down
    return determineNewPosition(tp, 'RD');
  }
  if(hp.x < tp.x && hp.y < tp.y) {
    // Head is to bottom left, move tail left down
    return determineNewPosition(tp, 'LD');
  }
}

const getGrid = (kp) => {
  const gridSizeX = 200;
  const gridSizeY = 48;
  // Draw a grid 25-ish around the head
  let headPos = kp[0];
  let xShift = 0;
  let yShift = 0;
  let wantedEdgeRoom = 12;
  let minX = wantedEdgeRoom;
  let maxX = gridSizeX - wantedEdgeRoom;
  let minY = wantedEdgeRoom;
  let maxY = gridSizeY - wantedEdgeRoom;
  //
  if(headPos.x > maxX) {
    xShift = - Math.abs(headPos.x - maxX);
  }
  if(headPos.x < minX) {
    xShift = Math.abs(headPos.x - wantedEdgeRoom);
  }
  if(headPos.y > maxY) {
    yShift = - Math.abs(headPos.y - maxY);
  }
  if(headPos.y < minY) {
    yShift = Math.abs(headPos.y - wantedEdgeRoom);
  }

  const lines = [];
  lines.push(``);
  lines.push(`Head position: x=${headPos.x}, y=${headPos.y} | Display shift: x=${xShift}, y=${yShift}`)
  lines.push(`\n`);

  for(let i=0; i<gridSizeY; i++) {
    let line = ''+ (i+yShift).toString().padStart(2)+ ' ';
    for(let j=0; j<gridSizeX; j++) {
      let knotFound = false;
      for(let k=0; k<kp.length; k++) {
        const knot = kp[k];

        if((knot.x + xShift) === j && (knot.y + yShift) === i) {
          // \x1b[33m Welcome to the app! \x1b[0m
          if(k===0) line += '\x1b[91mH\x1b[0m';
          //   else line += '\x1b[95m'+k.toString(10)+'\x1b[0m';
          else line += '\x1b[95m'+k.toString(10)+'\x1b[0m';
          //🐍
          knotFound = true;
          break;
        }
      }
      if(!knotFound) line += '·';
    }
    lines.push(line);
  }
  const reversed = lines.reverse();
  return reversed.join("\n") + "\n";
}

let numKnots = 10;
const setupKnots = (numKnots, initialX = 0, initialY = 0) => {
  let arr = [];
  for(let i=0; i<numKnots; i++) {
    arr.push({x:initialX,y:initialY});
  }
  return arr;
}

const displayGrid = async (positions, title) => {
  const gridTxt = getGrid(positions);
  console.clear();
  console.log(`${title}\n${gridTxt}`);
  await delay(20);
}

let currentKnotPositions = setupKnots( numKnots, 50, 33);
let ins = 0;
let previousKnotPositions;
const run = async () => {
  for (let {dir, steps} of instructions) {
    ins++;
    const title = `Motion ${ins.toString().padStart(4, ' ')} / ${numInstructions}: ${dir} ${steps} \n`;

    for (let i = 0; i < steps; i++) {

      previousKnotPositions = [...currentKnotPositions];
      // Current position of head
      let chp = previousKnotPositions[0];
      // New head position
      const nhp = determineNewPosition(chp, dir);
      currentKnotPositions[0] = nhp;

      if(nhp.x !== chp.x || nhp.y !== chp.y) {
        await displayGrid(currentKnotPositions,title);
      }

      // All following knots:
      for (let j = 1; j < numKnots; j++) {
        // Current position of this knot
        let ckp = previousKnotPositions[j];

        // New position of previous knot
        let npkp = currentKnotPositions[j - 1];

        // New knot position
        const nkp = determineNewKnotPosition(npkp, ckp);
        currentKnotPositions[j] = nkp;

        if(nkp.x !== ckp.x || nkp.y !== ckp.y) {
          await displayGrid(currentKnotPositions, title);
        }
      }
    }
  }
};

run();
