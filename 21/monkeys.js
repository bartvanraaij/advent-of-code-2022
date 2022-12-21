const fs = require('fs');
const sampleData = fs.readFileSync('sample.txt', 'utf8');
const inputData = fs.readFileSync('input.txt', 'utf8');

String.prototype.toInt = function () {
  return parseInt(this,10);
}

class Referee {
  name;
  dep1Name;
  dep2Name;
  dep1;
  dep2;
  constructor({name, dep1, dep2}) {
    this.name = name;
    this.dep1Name = dep1;
    this.dep2Name = dep2;
  }
}

const performOperation = (value1, value2, operation) => {
  let result;
  if(operation === '+') {
    result = value1+value2;
  }
  if(operation === '-') {
    result = value1-value2;
  }
  if(operation === '*') {
    result = value1*value2;
  }
  if(operation === '/') {
    result = value1/value2;
  }
  return result;
}

class Monkey {
  name;
  number;
  dep1Name;
  dep2Name;
  dep1;
  dep2;
  operation;

  constructor({name, number, dep1, dep2, operation}) {
    this.name = name;
    if(typeof number === 'string') {
      this.number = number.toInt();
    }
    else {
      this.number = number ?? null;
    }
    this.dep1Name = dep1;
    this.dep2Name = dep2;
    this.operation = operation;
  }

  getCalculation() {
    if(this.hasOperation()) {
      const dep1calc = this.dep1.getCalculation();
      const dep2calc = this.dep2.getCalculation();
      if(typeof dep1calc === 'number' && typeof dep2calc === 'number') {
        return performOperation(dep1calc, dep2calc, this.operation);
      }
      return [
        dep1calc,
        this.operation,
        dep2calc
      ]
    } else if(this.number) {
        return this.number;
    } else {
      return this.name;
    }
  }

  canOperate() {

    return (this.dep1.number!==null) && (this.dep2.number!==null);
  }
  hasOperation() {
    return !!this.operation;
  }
  operate() {
    let prevNumber = this.number;
    this.number = performOperation(this.dep1.number, this.dep2.number, this.operation);
    return prevNumber!==this.number;
  }
}

class Tribe {

  monkeys;
  referee;
  human;

  constructor() {
    this.monkeys = new Map();
  }

  getMonkeys() {
    return this.monkeys.values();
  }

  addMonkey(monkey) {
    this.monkeys.set(monkey.name, monkey);
  }

  setReferee(monkey) {
    this.referee = monkey;
  }
  setAllMonkeyDeps() {
    for(let monkey of this.monkeys.values()) {
      if(! monkey.operation) continue;
      monkey.dep1 = this.monkeys.get(monkey.dep1Name);
      monkey.dep2 = this.monkeys.get(monkey.dep2Name);
    }
    if(this.referee) {
      this.referee.dep1 = this.monkeys.get(this.referee.dep1Name);
      this.referee.dep2 = this.monkeys.get(this.referee.dep2Name);
    }
  }
  setHuman(human) {
    this.human = human;
    this.human.number = null;
  }
}

const parseInput = (inputData) => {
  const monkeyInputRegex = new RegExp(
    '(?<name>[a-z]{4}):\\s((?<number>\\d+)|(?:(?<dep1>[a-z]{4})\\s(?<operation>[\\+\\-*\\/]) (?<dep2>[a-z]{4})))');

  const tribe = new Tribe();

  for(let line of inputData.split("\n")) {
    const matches = monkeyInputRegex.exec(line).groups;
    const monkey = new Monkey(matches);
    tribe.addMonkey(monkey);
  }
  tribe.setAllMonkeyDeps();
  return tribe;
}

const findMonkeysNumber = (tribe, monkeyToFindName) => {
  while(true) {
    for(let monkey of tribe.getMonkeys()) {
      if(monkey.name === monkeyToFindName) {
        if(monkey.number !== null) return monkey.number;
      }
      if(monkey.number !== null) continue;

      if(monkey.canOperate()) {
        let changed = monkey.operate();
        if(changed) break; // Start over!
      }
    }
  }
}

// Part 1
const findMonkeysNumberFromInput = (inputData, monkeyNumberToFind) => {
  const tribe = parseInput(inputData);
  return findMonkeysNumber(tribe, monkeyNumberToFind);
}

const monkeyRootNumber = findMonkeysNumberFromInput(inputData, 'root');
console.log(monkeyRootNumber);


// Part 2
const parseInputFixed = (inputData) => {

  const monkeyInputRegex = new RegExp(
    '(?<name>[a-z]{4}):\\s((?<number>\\d+)|(?:(?<dep1>[a-z]{4})\\s(?<operation>[\\+\\-*\\/]) (?<dep2>[a-z]{4})))');

  const tribe = new Tribe();

  for(let line of inputData.split("\n")) {
    const matches = monkeyInputRegex.exec(line).groups;
    if(matches.name === 'root') {
      const ref = new Referee(matches);
      tribe.setReferee(ref);
    } else {
      const monkey = new Monkey(matches);
      tribe.addMonkey(monkey);

      if(monkey.name === 'humn') {
        tribe.setHuman(monkey);
      }
    }

  }
  tribe.setAllMonkeyDeps();
  return tribe;
}

const tribe = parseInputFixed(inputData);

const displayCalculation = (calc) => {
  if(typeof calc === 'number') return `${calc.toString()}`;
  const parts = [];
  for(let component of calc) {
    if(typeof component === 'number' || typeof component === 'string') {
      parts.push(component);
    }
    else {
      parts.push(displayCalculation(component));
    }
  }
  return `(${parts.join(' ')})`;
}

const refereeDep1 =  tribe.referee.dep1;
const refDep1Calcs = refereeDep1.getCalculation();
console.log({n:tribe.referee.dep1.name, c:refDep1Calcs});

const refereeDep2 =  tribe.referee.dep2;
const refDep2Calcs = refereeDep2.getCalculation();
console.log(refDep2Calcs);
console.log({n:tribe.referee.dep2.name, c:refDep2Calcs});

const d1cal = displayCalculation(refDep1Calcs);
const d2cal = displayCalculation(refDep2Calcs);
const numberCal = typeof refDep1Calcs === 'number' ? refDep1Calcs:refDep2Calcs;
const nonNumberCal = typeof refDep1Calcs === 'number' ? refDep2Calcs:refDep1Calcs;
const numberDepName = typeof refDep1Calcs === 'number' ? refereeDep1.name: refereeDep2.name;
const nonNumberDepName = typeof refDep1Calcs === 'number' ? refereeDep2.name: refereeDep1.name;
//
console.log(d1cal);
console.log({numberDepName,nonNumberDepName});

const getOppositeOperation = (op) => {
  if(op ==='+') return '-';
  if(op ==='-') return '+';
  if(op ==='*') return '/';
  if(op ==='/') return '*';
}

const solveEquation = (equation) => {

  let solution = equation[0];
  if(equation[1]==='humn') {
    return solution;
  }

  let [lhs, operation, rhs] = equation[1];

  const numberSide = typeof lhs === 'number' ? lhs:rhs;
  const nonNumberSide = typeof lhs === 'number' ? rhs:lhs;

  const oppositeOperation = getOppositeOperation(operation);
  const wantedValue = performOperation(solution, numberSide, oppositeOperation);
  solution = solveEquation([wantedValue, nonNumberSide]);

  return solution;
}



// console.log(d2cal);
// console.log(nonNumberCal);
const answer = solveEquation([numberCal, nonNumberCal]);
console.log({answer});
const a1 = Math.floor(answer);
const a2 = Math.ceil(answer);
console.log({answer,a1,a2});
