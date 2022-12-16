const fs = require('fs');
const sampleData = fs.readFileSync('sample.txt', 'utf8');
const inputData = fs.readFileSync('input.txt', 'utf8');

String.prototype.toInt = function () {
  return parseInt(this,10);
}

const breadthFirstSearchDistances = function (adjacencyList, currentValve) {
  const queue = [
    currentValve
  ];
  const visited = new Set([currentValve]);
  const distances = new Map([[currentValve,0]]);

  while (queue.length > 0) {
    const valve = queue.shift();
    const adjacentValves = adjacencyList[valve] ?? [];
    for (let visitingValve of adjacentValves) {
      if (!visited.has(visitingValve)) {
        distances.set(visitingValve, distances.get(valve) +1);
        visited.add(visitingValve);
        queue.push(visitingValve);
      }
    }
  }
  return distances;
}

const buildAdjacencyList = (valves) => {
  const list = {};
  for(let [key,valve] of valves) {
    list[key] = valve.neighbours;
  }
  return list;
}

const getValves = (input) => {
  const valves = new Map();
  for(let line of input.split('\n')) {
    const [valve, ...neighbours] = Array.from(line.matchAll(/([A-Z]{2})/g)).map(r => r[0]);
    const flowRate = line.match(/(\d+)/g)[0].toInt();
    valves.set(valve, {
      key: valve,
      neighbours,
      flowRate
    });
  }
  const adjacencyList = buildAdjacencyList(valves);
  for(let [valveKey,valve] of valves) {
    valve.distanceToOtherValves = breadthFirstSearchDistances(adjacencyList, valveKey);
    valves.set(valveKey,valve);
  }
  return valves;
}

const findHighestPressureReleasePath = (currentValve, valves, steps = 30, openedValves = []) => {

  let highestTotalRelease = 0;
  openedValves.push(currentValve.key);

  for(let [destValveKey, destination] of valves) {
    if(openedValves.includes(destValveKey)) {
      // It doesn't make sense travelling to valve that's already open
      continue;
    }
    if(destination.flowRate <= 0) {
      // It doesn't make sense travelling to a valve that doesn't have flow
      continue;
    }

    const distanceToDestination = currentValve.distanceToOtherValves.get(destination.key);
    const stepsLeft = steps - distanceToDestination - 1; // Minus 1 for opening the valve
    if(stepsLeft >= 0) {

      let openingThisValveWillRelease = stepsLeft * (destination.flowRate);
      let thisTotalRelease = findHighestPressureReleasePath(destination, valves, stepsLeft,[...openedValves]);

      openingThisValveWillRelease += thisTotalRelease;
      if (openingThisValveWillRelease > highestTotalRelease) {
        highestTotalRelease = openingThisValveWillRelease;
      }
    }
  }
  return highestTotalRelease;
}

const findHighestPressureReleasePathFromInput = (inputData, startValveKey = 'AA', steps = 30) => {
  const valves = getValves(inputData);
  const startValve = valves.get(startValveKey);
  return findHighestPressureReleasePath(startValve, valves,steps);
}

// Part 1
const totalPressureRelease = findHighestPressureReleasePathFromInput(inputData);
console.log(totalPressureRelease);