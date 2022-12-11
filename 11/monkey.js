const fs = require('fs');
const rawData = fs.readFileSync('input.txt', 'utf8');

String.prototype.toInt = function () {
  return parseInt(this,10);
}
const toInt = (str) => parseInt(str, 10);

const monkeys = rawData.split("\n\n").map(str => {
  const lines = str.split("\n");
  const monkey = lines[0].charAt(7).toInt();
  const items = lines[1].substring(18).split(", ").map(toInt);
  const operationType = lines[2].charAt(23);
  const operationValue = lines[2].substring(25);//.toInt();
  const testModulo = lines[3].substring(21).toInt();
  const destIfTrue = lines[4].charAt(29).toInt();
  const destIfFalse = lines[5].charAt(30).toInt();
  const inspectionCount = 0;
  return {monkey,items, operationType, operationValue, testModulo, destIfTrue, destIfFalse, inspectionCount};
});

// Part 1
// let numRounds = 20;
// for(let i=1; i <= numRounds; i++) {
//
//   for(let monkey of monkeys) {
//     for(let item of monkey.items) {
//       let level;
//       let operationValue = monkey.operationValue === 'old' ? item : monkey.operationValue.toInt();
//       if(monkey.operationType === '*') level = item * operationValue;
//       else level = item + operationValue;
//       level = Math.floor(level/3);
//       const destMonkey = (level % monkey.testModulo === 0) ? monkeys[monkey.destIfTrue] : monkeys[monkey.destIfFalse];
//       destMonkey.items.push(level);
//       monkey.inspectionCount++;
//     }
//     monkey.items = [];
//   }
// }
// for(let monkey of monkeys) {
//   console.log(`Monkey ${monkey.monkey}: ${monkey.items.join(', ')}`);
// }
// for(let monkey of monkeys) {
//   console.log(`Monkey ${monkey.monkey} inspected items : ${monkey.inspectionCount} times`);
// }
// let monkeyActivityScores = monkeys.map(m => m.inspectionCount).sort((a, b) => {
//   return a - b;
// }).reverse();
//
// const monkeyBusinessLevel = monkeyActivityScores[0] * monkeyActivityScores[1];
// console.log(monkeyBusinessLevel);

// Part 2
let numRounds = 10000;
let worryLevelDivider = monkeys.reduce((acc, monkey) => {
  return acc * monkey.testModulo
}, 1);

for(let i=1; i <= numRounds; i++) {

  for(let monkey of monkeys) {
    for(let item of monkey.items) {
      let level;
      if(monkey.operationValue === 'old') {
        level = item * item;
      } else {
        if(monkey.operationType === '*') level = item * monkey.operationValue.toInt();
        else level = item + monkey.operationValue.toInt();
      }
      level = level % worryLevelDivider;

      const destMonkey = ((level % monkey.testModulo) === 0) ? monkeys[monkey.destIfTrue] : monkeys[monkey.destIfFalse];
      destMonkey.items.push(level);
      monkey.inspectionCount++;
    }
    monkey.items = [];
  }
}
for(let monkey of monkeys) {
  console.log(`Monkey ${monkey.monkey}: ${monkey.items.join(', ')}`);
}
for(let monkey of monkeys) {
  console.log(`Monkey ${monkey.monkey} inspected items : ${monkey.inspectionCount} times`);
}
let monkeyActivityScores = monkeys.map(m => m.inspectionCount).sort((a, b) => {
  return a - b;
}).reverse();
console.log(monkeyActivityScores);

const monkeyBusinessLevel = monkeyActivityScores[0] * monkeyActivityScores[1];
console.log(monkeyBusinessLevel);