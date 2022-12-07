const fs = require('fs');
const rawData = fs.readFileSync('input.txt', 'utf8');
const lines = rawData.split("\n");

const parseInstruction = (line) => {
  const pieces = line.split(" ");
  if(pieces[0] === '$' && pieces[1] === 'cd') {
    return {
      type: 'cd',
      dest: pieces[2]
    }
  }
  if(pieces[0] === '$' && pieces[1] === 'ls') {
    return {
      type: 'ls',
    }
  }
  if(pieces[0] === 'dir') {
    return {
      type: 'dir',
      dir: pieces[1],
    }
  }
  else {
    return {
      type: 'file',
      size: parseInt(pieces[0], 10),
      file: pieces[1]
    }
  }
}

const getObjectValueByPath = (object, path, _default) => {
  for(let key of path) {
    if(object.hasOwnProperty(key)) object = object[key];
    else return _default;
  }
  return object;
}

const setObjectValueByPath = (object, path, value) => {
  const lastKey = path.pop();
  for(let key of path) {
    if(!object.hasOwnProperty(key)) object[key] = {};
    object = object[key];
  }
  object[lastKey] = value;
}

const instructions = lines.map(parseInstruction);

const buildTree = (instructions) => {
  const tree = {};
  let wd = []; // Working directory

  for(let inst of instructions) {
    if(inst.type === 'cd') {
      if(inst.dest === '/') wd = [];
      else if(inst.dest === '..') wd.pop();
      else {
        wd.push(inst.dest);
      }
    }
    if(inst.type === 'dir') {
      // Nothing?
    }
    if(inst.type === 'ls') {
      // Nothing?
    }
    if(inst.type === 'file') {
      let path = [...wd, 'files'];
      let files = getObjectValueByPath(tree, path, []);
      files.push(inst);
      setObjectValueByPath(tree, path, files);
    }
  }
  return tree;
}

const tree = buildTree(instructions);

function addSizesRecursively(tree) {
  let total = 0;
  for(let prop in tree) {
    if(prop === 'files') {
      tree.size = tree['files'].reduce((acc, file) => {
        return acc + file.size
      }, 0);
      total += tree.size;
    }
    else if(prop === 'size') {
    }
    else {
      tree[prop] = addSizesRecursively(tree[prop]);
      total += tree[prop].total;
    }
  }
  tree.total = total;
  return tree;
}
const treeWithSizes = addSizesRecursively(tree);

function getAllSizesRecursively(tree) {
  let sizes = [];
  for(let prop in tree) {
    if(prop === 'files' || prop === 'size') { }
    else if(prop === 'total') {
      sizes.push(tree.total);
    } else {
      sizes = [...sizes, ...getAllSizesRecursively(tree[prop])];
    }
  }
  return sizes;
}

const allSizes = getAllSizesRecursively(treeWithSizes);
const belowThreshold = allSizes.filter(size => size <= 100000);
const sum = belowThreshold.reduce((acc, curr) => acc+curr, 0);
console.log(sum);

// Part 2
const totalStorage = 70000000;
const currentFreeSpace = totalStorage - treeWithSizes.total;
const freeSpaceNeeded = 30000000;
const freeUpAtLeast = freeSpaceNeeded - currentFreeSpace;

const aboveThreshold = allSizes.filter(size => size >= freeUpAtLeast);
const smallest = Math.min(...aboveThreshold);
console.log(smallest);
