const fs = require('fs');
const {Equation, parse} = require("algebra.js");
const sampleData = fs.readFileSync('sample.txt', 'utf8');
const inputData = fs.readFileSync('input.txt', 'utf8');

String.prototype.toInt = function () {
  return parseInt(this,10);
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

const calculationToString = (calc) => {
  if(typeof calc === 'number') return `${calc.toString()}`;
  const parts = [];
  for(let component of calc) {
    if(typeof component === 'number' || typeof component === 'string') {
      parts.push(component);
    }
    else {
      parts.push(calculationToString(component));
    }
  }
  return `(${parts.join(' ')})`;
}

class Monkey {
  name;
  number;
  dependencyNames;
  dependencies;
  operation;

  constructor({name, number, dependencyNames, operation}) {
    this.name = name;
    if(typeof number === 'string') {
      this.number = number.toInt();
    }
    else {
      this.number = number ?? null;
    }
    this.dependencyNames = dependencyNames;
    this.operation = operation;
  }

  getCalculation() {
    if(this.hasOperation()) {

      const firstDependencyCalculation = this.dependencies[0].getCalculation();
      const secondDependencyCalculation = this.dependencies[1].getCalculation();

      if( typeof firstDependencyCalculation === 'number' && typeof secondDependencyCalculation === 'number') {
        return performOperation(firstDependencyCalculation, secondDependencyCalculation, this.operation);
      } else {
        return [
          firstDependencyCalculation,
          this.operation,
          secondDependencyCalculation
        ];
      }
    } else if(this.number) {
        return this.number;
    } else {
      return this.name;
    }
  }

  canOperate() {
    return (this.dependencies[0].number!==null) && (this.dependencies[1].number!==null);
  }
  hasOperation() {
    return !!this.operation;
  }
  operate() {
    let prevNumber = this.number;
    this.number = performOperation(this.dependencies[0].number, this.dependencies[1].number, this.operation);
    return prevNumber!==this.number;
  }
}

class Referee extends Monkey {

}

class Human extends Monkey {
  constructor({name}) {
    super({name, number: 0 });
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

  getOperatingMonkeys() {
    return [...this.monkeys.values()].filter(m => m.hasOperation());
  }

  addMonkey(monkey) {
    this.monkeys.set(monkey.name, monkey);
  }

  setReferee(referee) {
    this.referee = referee;
  }

  setHuman(human) {
    this.human = human;
    this.monkeys.set(human.name, human);
  }

  presetAllDependencies() {
    for(let monkey of this.getMonkeys()) {
      if(! monkey.operation) continue;
      monkey.dependencies = monkey.dependencyNames.map(name => this.monkeys.get(name));
    }
    if(this.referee) {
      this.referee.dependencies = this.referee.dependencyNames.map(name => this.monkeys.get(name));
    }
  }
}

const parseInput = (inputData, refereeName = false, humanName = false) => {
  const monkeyInputRegex = new RegExp(
    '(?<name>[a-z]{4}):\\s((?<number>\\d+)|(?:(?<firstDependencyName>[a-z]{4})\\s(?<operation>[\\+\\-*\\/]) (?<secondDependencyName>[a-z]{4})))');

  const tribe = new Tribe();
  for(let line of inputData.split("\n")) {
    const matches = monkeyInputRegex.exec(line).groups;
    const monkeyData = {...matches, dependencyNames: [matches.firstDependencyName, matches.secondDependencyName]};
    if(refereeName && matches.name === refereeName) {
      const referee = new Referee(monkeyData);
      tribe.setReferee(referee);
    }
    else if(humanName && matches.name === humanName) {
      const human = new Human(monkeyData);
      tribe.setHuman(human);
    } else {
      const monkey = new Monkey(monkeyData);
      tribe.addMonkey(monkey);
    }
  }
  tribe.presetAllDependencies();
  return tribe;
}

const findMonkeysNumber = (tribe, monkeyToFindName) => {
  const monkeysToVisit = tribe.getOperatingMonkeys();
  while(true) {
    for(let monkey of monkeysToVisit) {
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
const getMonkeyTribeHumanEquationAnswer = (tribe) => {
  const refereeCalculations = tribe.referee.dependencies.map((dependency) => calculationToString(dependency.getCalculation()));
  const equation = new Equation(parse(refereeCalculations[0]), parse(refereeCalculations[1]));
  return equation.solveFor(tribe.human.name).numer;
}

const findHumanNumberFromInput = (inputData) => {
  const tribe = parseInput(inputData, 'root', 'humn');
  return getMonkeyTribeHumanEquationAnswer(tribe);
  return findMonkeysNumber(tribe, monkeyNumberToFind);
}

const answer = findHumanNumberFromInput(inputData);
console.log(answer);