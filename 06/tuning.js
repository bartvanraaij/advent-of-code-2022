const fs = require('fs');
const mode = 'input';
const input = fs.readFileSync(`${mode}.txt`, 'utf8');

const allCharsDifferent = (input) => {
  return ! /(.).*\1/.test(input);
};

// Part 1
for(let i=0; i<input.length-3; i++) {
  // Next 4
  const marker = input.substring(i, i+4);
  if(allCharsDifferent(marker)) {
    console.log({marker, pos: i+4});
    break;
  }
}

// Part 2
for(let i=0; i<input.length-13; i++) {
  // Next 14 are
  const marker = input.substring(i, i+14);
  if(allCharsDifferent(marker)) {
    console.log({marker, pos: i+14});
    break;
  }
}