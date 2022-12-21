const fs = require('fs');
const sampleData = fs.readFileSync('sample.txt', 'utf8');
const inputData = fs.readFileSync('input.txt', 'utf8');

String.prototype.toInt = function () {
  return parseInt(this,10);
}

class Monkey {
  name;
  number;
  dep1;
  dep2;
  operation;

  constructor({name, number, dep1, dep2, operation}) {
    this.name = name;
    this.number = number ? number.toInt() : null;
    this.dep1 = dep1;
    this.dep2 = dep2;
    this.operation = operation;
  }
  hasNumber() {
    return this.number !== null;
  }
  operate(dep1Number, dep2Number) {
    if(this.operation === '+') {
      this.number = dep1Number + dep2Number;
    }
    else if(this.operation === '-') {
      this.number = dep1Number - dep2Number;
    }
    else if(this.operation === '*') {
      this.number = dep1Number * dep2Number;
    }
    else if(this.operation === '/') {
      this.number = dep1Number / dep2Number;
    }
  }
}

class Tribe {

  monkeys;

  constructor() {
    this.monkeys = new Map();
  }

  getMonkeys() {
    return this.monkeys.values();
  }

  addMonkey(monkey) {
    this.monkeys.set(monkey.name, monkey);
  }

  getMonkeyNumberByName(monkeyName) {
    return this.monkeys.get(monkeyName).number;
  }

  monkeyCanOperate(monkey) {
    const dep1 = this.monkeys.get(monkey.dep1);
    if(! dep1.number) {
      return false;
    }
    const dep2 = this.monkeys.get(monkey.dep2);
    if(! dep2.number) {
      return false;
    }
    return true;
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
  return tribe;
}

const findMonkeysNumber = (tribe, monkeyToFindName) => {
  while(true) {
    for(let monkey of tribe.getMonkeys()) {
      if(monkey.name === monkeyToFindName) {
        if(monkey.number !== null) return monkey.number;
      }
      if(monkey.number) continue;

      if(tribe.monkeyCanOperate(monkey)) {
        monkey.operate(tribe.getMonkeyNumberByName(monkey.dep1), tribe.getMonkeyNumberByName(monkey.dep2));
        break; // Start over!
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
