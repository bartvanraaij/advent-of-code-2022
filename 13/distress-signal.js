const fs = require('fs');
const rawData = fs.readFileSync('input.txt', 'utf8');

const packetPairsStrs = rawData.split('\n\n');
const parsePacket = (input) => {
  return JSON.parse(input);
}

const packetPairs = packetPairsStrs.map((str) => {
  return str.split('\n').map(parsePacket);
});

const compareSignal = (a, b) => {
  console.log(`- Compare ${JSON.stringify(a)} vs ${JSON.stringify(b)}`);
  if(typeof a === 'number' && typeof b === 'number') {
    return b-a;
  }
  if(typeof a !== undefined && b===undefined) {
    // Right side ran out of items
    console.log('Right side ran out of items');
    return -1;
  }
  if(typeof a === 'number' && typeof b === 'object') {
    return compareSignal([a], b);
  }
  if(typeof a === 'object' && typeof b === 'number') {
    return compareSignal(a, [b]);
  }

  if(typeof a === 'object' && typeof b === 'object') {
    for (let i = 0; i < a.length; i++) {
      const score = compareSignal(a[i], b[i]);
      if(score !== 0) return score;
    }

    if(b.length > a.length) {
      // Left side ran out of items
      console.log('Left side ran out of items');
      return 1;
    }

    return 0;
  }
  console.error('Unexpected comparison', {a,b});
};

let correctlyOrderedPacketPairs = [];

for(let i in packetPairs) {
  const index = parseInt(i, 10)+1;
  console.log(`== Pair ${index} ==`);
  const packetPair = packetPairs[i];
  let thisPairCorrect = compareSignal(packetPair[0], packetPair[1]) >= 0;

  if(thisPairCorrect) {
    console.log(`Pair ${index} is in the right order`);
    correctlyOrderedPacketPairs.push(index);
  } else {
    console.log(`Pair ${index} is not in the right order`);
  }
  console.log('');
}

correctlyOrderedPacketPairsSum = correctlyOrderedPacketPairs.reduce((a, i) => a+i);
console.log(correctlyOrderedPacketPairsSum);
