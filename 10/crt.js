const fs = require('fs');
const rawData = fs.readFileSync('input.txt', 'utf8');

const program = rawData.split("\n").map((str) => {
  let [instr,num] = str.split(' ');
  return { instr, value: parseInt(num, 10) }
});

let cycles = [];
for(let line of program) {
  cycles.push(0); // Add 0 for noop and the first iteration of addx
  if(line.instr === 'addx') {
    cycles.push(line.value)
  }
}

// Part 1
let x = 1;
let wantedSignalsSum = 0;
for(let i=1; i<=cycles.length; i++) {
  if((i-20) % 40 === 0) {
    wantedSignalsSum += (x*i);
  }
  x = x+cycles[i-1];
}
console.log(wantedSignalsSum);

// Part 2
let spritePos = 1;
let pixel = 0;
for(let cycle=1; cycle<=cycles.length; cycle++) {

  if(spritePos-1 === pixel || spritePos === pixel || spritePos+1 === pixel) {
    process.stdout.write('★');
  } else {
    process.stdout.write(' ');
  }

  spritePos = spritePos+cycles[cycle-1];
  pixel++;

  if(cycle % 40 === 0) {
    pixel = 0;
    process.stdout.write('\n');
  }
}
