const util = require('util');
const readline = require('readline');
const fs = require("fs");
const cp = require("child_process");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const askQuestion = util.promisify(rl.question).bind(rl);
const readDir = util.promisify(fs.readdir).bind(fs);

const askAndRunAssignment = async () => {
  try {
    const assignmentNum = (await askQuestion('Which assignment do you want run? ')).padStart(2, '0');

    process.chdir(assignmentNum);
    const jsFile = (await readDir('.')).filter(file => file.substring(file.length -2) === 'js')[0];

    process.stdout.write(`Okay, here is the output of \x1b[34m${jsFile}\x1b[0m for assignment \x1b[34m${assignmentNum}\x1b[0m: \n`);
    cp.fork(jsFile);

  } catch (err) {
    console.error('Question rejected', err);
  }
}
askAndRunAssignment().then(() => {
  rl.close()
});