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

// Part 2
const findNextBestPressureReleasePathAndAccumulateRouteScores = (currentValve, valves, steps = 26, openedValves = [], currentBest = Infinity, currentAccumulatedFlow = 0, routeFlowScoresMap) => {

  let highestTotalRelease = 0;
  openedValves.push(currentValve.key);

  for(let destination of valves) {
    let destValveKey = destination.key;
    if(openedValves.includes(destValveKey)) {
      // It doesn't make sense travelling to valve that's already open
      continue;
    }

    const routeKey = getRouteKey(openedValves);
    if(routeKey) {
      if(routeFlowScoresMap.has(routeKey)) {
        let currentBestAcc = routeFlowScoresMap.get(routeKey);
        if(currentAccumulatedFlow > currentBestAcc) routeFlowScoresMap.set(routeKey, currentAccumulatedFlow);
      } else {
        routeFlowScoresMap.set(routeKey, currentAccumulatedFlow);
      }
    }

    const distanceToDestination = currentValve.distanceToOtherValves.get(destination.key);
    const stepsLeft = steps - distanceToDestination - 1; // Minus 1 for opening the valve
    if(stepsLeft >= 0) {

      let openingThisValveWillReleaseSolo = stepsLeft * (destination.flowRate);

      let allNextStepsWillRelease = findNextBestPressureReleasePathAndAccumulateRouteScores(destination, valves, stepsLeft,[...openedValves], currentBest,currentAccumulatedFlow+openingThisValveWillReleaseSolo, routeFlowScoresMap);

      let openingThisValveWillRelease = openingThisValveWillReleaseSolo + allNextStepsWillRelease;

      if(openingThisValveWillRelease > highestTotalRelease && openingThisValveWillRelease < currentBest) {
        highestTotalRelease = openingThisValveWillRelease;
      }

    }
  }
  return highestTotalRelease;
}

const getRouteKey = (valvesList) => {
  return valvesList.filter(v => v!=='AA').sort().join('.');
}

const routeKeyToValves = (routeKey) => {
  return routeKey.split('.')
}

const getAllRouteFlowScores = (valves, startValveName = 'AA', steps= 26) => {

  const valvesToVisit = [...valves.values()].filter((v) => v.key === 'AA' || v.flowRate>0);
  const startValve = valves.get(startValveName);

  let routeFlowScores = new Map();

  let highestResult = Infinity;
  do {
    highestResult = findNextBestPressureReleasePathAndAccumulateRouteScores(startValve, valvesToVisit, steps, [], highestResult, 0, routeFlowScores);
  } while(highestResult > 0);

  // Fill in the highest found score for subset for combinations that aren't in the list yet
  const allPressuredValveNames = [...valves.values()].filter((v) => v.flowRate>0).map(v => v.key);
  const findSubrouteScoreForRouteFlow = (valvesList) => {
    const combinationKey = getRouteKey(valvesList);
    if(routeFlowScores.has(combinationKey)) {
      return routeFlowScores.get(combinationKey);
    }
    if(! routeFlowScores.has(combinationKey)) {
      // Find subset score by removing one of the list
      let bestSubsetScore = 0;
      for(let i in valvesList) {
        const newList = [...valvesList];
        newList.splice(i.toInt(), 1);
        const thisSubscore = findSubrouteScoreForRouteFlow(newList);
        if(thisSubscore > bestSubsetScore) {
          bestSubsetScore = thisSubscore;
        }
      }
      routeFlowScores.set(combinationKey, bestSubsetScore);
    }
  }
  findSubrouteScoreForRouteFlow(allPressuredValveNames);

  return routeFlowScores;
}

const findBestCombinedFlowScore = (inputData) => {

  const valves = getValves(inputData);
  const routeFlowScores = getAllRouteFlowScores(valves, 'AA', 26);

  const allPressuredValveNames = [...valves.values()].filter((v) => v.flowRate>0).map(v => v.key);
  let bestCombinedFlowScore = 0;
  for(let [myRouteKey, myScore] of routeFlowScores) {
    const myValves = routeKeyToValves(myRouteKey);

    const elephantValves = allPressuredValveNames.filter(v => ! myValves.includes(v));

    const elephantCombinationKey = getRouteKey(elephantValves);
    const elephantScore = routeFlowScores.get(elephantCombinationKey);

    const thisCombiScore = myScore + elephantScore;

    if(thisCombiScore > bestCombinedFlowScore) {
      bestCombinedFlowScore = thisCombiScore;
    }
  }
  return bestCombinedFlowScore;
}

// Part 2:
const bestCombinedFlowScore = findBestCombinedFlowScore(inputData);
console.log(bestCombinedFlowScore);
