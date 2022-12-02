const fs = require('fs');

const getShape = (input) => {
  return {
    'A': 'R',
    'B': 'P',
    'C': 'S',
    'X': 'R',
    'Y': 'P',
    'Z': 'S',
  }[input];
};
const allShapes = ['R','P','S'];
const lastShapeIndex = allShapes.length-1;


function determineOutcomeScore(opponentShape, myShape) {
  // Draw is 3
  if(opponentShape === myShape) return 3;

  // A shape wins from the shape before it
  const opponentIndex = allShapes.indexOf(opponentShape);
  const myIndex = allShapes.indexOf(myShape);
  if((myIndex-1) === opponentIndex || (myIndex===0 && opponentIndex===lastShapeIndex)) return 6;

  return 0;
}

function determineShapeScore(myShape) {
  return allShapes.indexOf(myShape) + 1;
}

function determineScore(opponentShape, myShape) {
  return determineOutcomeScore(opponentShape, myShape) + determineShapeScore(myShape);
}

function determineShapeToPlay(opponentShape, desiredOutcome) {
  const opponentIndex = allShapes.indexOf(opponentShape);

  if(desiredOutcome === 'Y') {
    // Draw = same shape
    return allShapes[opponentIndex];
  }
  if(desiredOutcome === 'X') {
    // Lose = shape before it
    if(opponentIndex === 0) return allShapes[lastShapeIndex];
    else return allShapes[opponentIndex-1];
  }
  if(desiredOutcome === 'Z') {
    // Win = shape after it
    if(opponentIndex === lastShapeIndex) return allShapes[0];
    else return allShapes[opponentIndex+1];
  }
}

const rawData = fs.readFileSync('input.txt', 'utf8');
const gameStrs = rawData.split("\n");

// Round 1
let totalScore1 = 0;
for(let gameStr of gameStrs) {
  const [opponentShape, myShape] = gameStr.split(" ").map(getShape);
  const roundScore = determineScore(opponentShape, myShape);
  // console.log({opponentShape, myShape, roundScore});
  totalScore1 += roundScore;
}
console.log(totalScore1);

// Round 2
let totalScore2 = 0;
for(let gameStr of gameStrs) {
  const [opponentInput, desiredOutcome] = gameStr.split(" ");
  const opponentShape = getShape(opponentInput);
  const myShape = determineShapeToPlay(opponentShape, desiredOutcome);
  const roundScore = determineScore(opponentShape, myShape);
  console.log({opponentShape, myShape, desiredOutcome, roundScore});
  totalScore2 += roundScore;
}
console.log(totalScore2);



