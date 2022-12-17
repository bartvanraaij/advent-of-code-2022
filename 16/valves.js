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
// const totalPressureRelease = findHighestPressureReleasePathFromInput(inputData);
// console.log(totalPressureRelease);

// Part 2
// First, find all good routes:

const findNextBestPressureReleasePath = (currentValve, valves, steps = 26, openedValves = [], currentBest = Infinity, routeFlows, currentAccumulatedFlow = 0) => {

  let highestTotalRelease = 0;
  let bestRoute = [];
  openedValves.push(currentValve.key);

  for(let destination of valves) {
    let destValveKey = destination.key;
    if(openedValves.includes(destValveKey)) {
      // It doesn't make sense travelling to valve that's already open
      continue;
    }
    // if(destination.flowRate <= 0) {
    //   // It doesn't make sense travelling to a valve that doesn't have flow
    //   continue;
    // }

    const combinationKey = getCombinationKey(openedValves);
    if(combinationKey) {
      if(routeFlows.has(combinationKey)) {
        let currentBestAcc = routeFlows.get(combinationKey);
        if(currentAccumulatedFlow > currentBestAcc) routeFlows.set(combinationKey, currentAccumulatedFlow);
      } else {
        routeFlows.set(combinationKey, currentAccumulatedFlow);
      }

    }

    const distanceToDestination = currentValve.distanceToOtherValves.get(destination.key);
    const stepsLeft = steps - distanceToDestination - 1; // Minus 1 for opening the valve
    if(stepsLeft >= 0) {

      let openingThisValveWillReleaseSolo = stepsLeft * (destination.flowRate);

      let [allNextStepsRelease, allNextSteps] = findNextBestPressureReleasePath(destination, valves, stepsLeft,[...openedValves], currentBest, routeFlows, currentAccumulatedFlow+openingThisValveWillReleaseSolo);

      let openingThisValveWillRelease = openingThisValveWillReleaseSolo + allNextStepsRelease;

      // currentAccumulatedFlow = openingThisValveWillRelease;

      let thisRoute = [{
        step: 26-stepsLeft,
        stepsLeft: stepsLeft,
        valve: destValveKey,
        thisRelease:openingThisValveWillReleaseSolo,
        currentAccumulatedFlow: currentAccumulatedFlow,
        valvesOpened: openedValves
      }];

      if(openingThisValveWillRelease > highestTotalRelease && openingThisValveWillRelease < currentBest) {
        highestTotalRelease = openingThisValveWillRelease;
        bestRoute = [...thisRoute,...allNextSteps];
      }

    }
  }
  return [highestTotalRelease, bestRoute];
}

const getCombinationKey = (valvesList) => {
  return valvesList.filter(v => v!=='AA').sort().join('.');

  // return valvesList.sort().join(');')
}
const findAllRoutesAndRecordSubSteps = (valves, startValve, steps= 26) => {
  let allRoutes = [];
  let currentHighest = Infinity;

  // Breaking loD here, but okay
  let routeFlowScores = new Map();

  do {
    let [thisHighest, route] = findNextBestPressureReleasePath(
      startValve, valvesToVisit, steps, [], currentHighest, routeFlowScores, 0, 0);
    currentHighest = thisHighest;
    if(thisHighest > 0) {
      allRoutes.push({
        release: currentHighest,
        route: route
      });
    }
  } while(currentHighest > 0);

  return [allRoutes,routeFlowScores];
}

const valves = getValves(inputData);
// Filter valves here, more performant
const startValve = valves.get('AA');
const valvesToVisit = [...valves.values()].filter((v) => v.key === 'AA' || v.flowRate>0);
const [allRoutes,routeFlowScores] = findAllRoutesAndRecordSubSteps(valves, startValve);


// Fill in the other combinations
const allPressuredValveNames = [...valves.values()].filter((v) => v.flowRate>0).map(v => v.key);

const appendToRouteFlowScores = (valvesList) => {
  const combinationKey = getCombinationKey(valvesList);
  if(routeFlowScores.has(combinationKey)) {
    return routeFlowScores.get(combinationKey);
  }
  if(! routeFlowScores.has(combinationKey)) {
    // Find subset by removing one of the list
    let bestSubsetScore = 0;
    for(let i in valvesList) {
      const newList = [...valvesList];
      newList.splice(i.toInt(), 1);

      const thisSubscore = appendToRouteFlowScores(newList);
      if(thisSubscore > bestSubsetScore) {
        bestSubsetScore = thisSubscore;
      }
    }
    routeFlowScores.set(combinationKey, bestSubsetScore);
  }
}
appendToRouteFlowScores(allPressuredValveNames);


const getValveNamesFromCombinationKey = (combinationKey) => {
  return combinationKey.split('.')
}

let bestCombinedFlowScore = 0;
for(let [myCombinationKey, myScore] of routeFlowScores) {
  const myValves = getValveNamesFromCombinationKey(myCombinationKey);

  const elephantValves = allPressuredValveNames.filter(v => ! myValves.includes(v));

  const elephantCombinationKey = getCombinationKey(elephantValves);
  const elephantScore = routeFlowScores.get(elephantCombinationKey);

  const thisCombiScore = myScore + elephantScore;

  if(thisCombiScore > bestCombinedFlowScore) {
    console.log({myValves, elephantValves, thisCombiScore});
    bestCombinedFlowScore = thisCombiScore;
  }
}

console.log(bestCombinedFlowScore);





// console.dir(valves, {depth: null});
// console.log(allRoutes);
// Now, find the routes with the least overlap OR with the
// console.dir(allRoutes[0], {depth: null});
// const valvesOpenedInRouteOnStep = (route, step) => {
//   let valvesOpened = [];
//   for(let openingValveStep of route) {
//     if(openingValveStep.step <= step) {
//       valvesOpened = openingValveStep.valvesOpened;
//     }
//     if(openingValveStep.step > step) {
//       break;
//     }
//   }
//   return valvesOpened;
// }


// Find all routes with no overlap
// const routesWithoutOverlap = [];
// let overlaps = {};
// for(let i in allRoutes) {
//   let myRoute = allRoutes[i];
//   overlaps[i.toInt()] = [];
//
//   const valvesOpenedInMyRoute = myRoute.route[myRoute.route.length-1].valvesOpened;
//   for(let j in allRoutes) {
//     let elephantRoute = allRoutes[j];
//     const valvesOpenedElephantRoute = elephantRoute.route[elephantRoute.route.length-1].valvesOpened;
//     let overlap = valvesOpenedElephantRoute.filter(x => valvesOpenedInMyRoute.includes(x));
//     overlaps[i.toInt()][j] = overlap.length;
//     if(overlap.length === 0) {
//       routesWithoutOverlap.push([myRoute,elephantRoute]);
//     } else {
//       console.log(overlap);
//     }
//
//   }
// }
// // Find the best overlap
// let currentBest = 0;
// for(let overlappingRoutes of routesWithoutOverlap) {
//   // console.log(overlappingRoutes[0]);
//
//   const combinedScore = overlappingRoutes[0].release + overlappingRoutes[1].release;
//   console.log({
//     h: overlappingRoutes[0].release,
//     e: overlappingRoutes[1].release,
//     c: combinedScore
//   });
//   if(combinedScore > currentBest) {
//     const myOpenedValves = overlappingRoutes[0].route[overlappingRoutes[0].route.length-1].valvesOpened;
//     const valvesOpenedElephantRoute = overlappingRoutes[1].route[overlappingRoutes[1].route.length-1].valvesOpened;
//
//     console.log({myOpenedValves,valvesOpenedElephantRoute,combinedScore});
//     currentBest = combinedScore;
//   }
// }
// console.log(currentBest);

// const getFlowRate = ()

// const getRouteStep = (route, stepNum) => {
//   const items = route.filter(r => (r.step === stepNum));
//   if(items.length === 0) return null;
//   return items[0];
//
// }

// // Find the best combination until all valves opened
// let maxRelease = 0;
// let allCombs = [];
// let bestRouteCombination;
// let bestRouteReport;
// let leastOverlapsCombination;
// let currentMaxOverlaps = Infinity;
// for(let i in allRoutes) {
//   const myRoute = allRoutes[i];
//   for(let j in allRoutes) {
//     if(i===j) continue;
//     let thisCombinationCurrentAccumulation = 0;
//     let thisCombinationValvesOpenened = [];
//     let thisCombinationRouteReport = [];
//     let thisCombinationOverlap = 0;
//     const elephantRoute = allRoutes[j];
//     for(let step = 1; step<26; step++) {
//       let thisRoundReport = [];
//       const myRouteStep = getRouteStep(myRoute.route, step);
//       if(myRouteStep && ! thisCombinationValvesOpenened.includes(myRouteStep.valve)) {
//         thisCombinationCurrentAccumulation += myRouteStep.thisRelease;
//         thisCombinationValvesOpenened.push(myRouteStep.valve);
//         thisRoundReport.push(`I've opened ${myRouteStep.valve}, releasing ${myRouteStep.thisRelease}`);
//       }
//       if(myRouteStep && thisCombinationValvesOpenened.includes(myRouteStep.valve)) {
//         thisCombinationOverlap++;
//       }
//       const elephantRouteStep = getRouteStep(elephantRoute.route, step);
//       if(elephantRouteStep && ! thisCombinationValvesOpenened.includes(elephantRouteStep.valve)) {
//         thisCombinationCurrentAccumulation += elephantRouteStep.thisRelease;
//         thisCombinationValvesOpenened.push(elephantRouteStep.valve);
//         thisRoundReport.push(`Elephant has opened ${elephantRouteStep.valve}, releasing ${elephantRouteStep.thisRelease}`);
//       }
//       if(elephantRouteStep && thisCombinationValvesOpenened.includes(elephantRouteStep.valve)) {
//         thisCombinationOverlap++;
//       }
//       if(thisRoundReport.length ===0) {
//         thisRoundReport.push('Nothing in this round');
//       }
//
//       thisCombinationRouteReport.push(thisRoundReport);
//     }
//     allCombs.push(thisCombinationCurrentAccumulation);
//     if(thisCombinationCurrentAccumulation > maxRelease) {
//       maxRelease = thisCombinationCurrentAccumulation;
//       bestRouteCombination = [myRoute,elephantRoute,thisCombinationValvesOpenened];
//       bestRouteReport = thisCombinationRouteReport;
//     }
//     console.log(thisCombinationOverlap);
//     if(thisCombinationOverlap < currentMaxOverlaps) {
//       currentMaxOverlaps = thisCombinationOverlap;
//       leastOverlapsCombination = [thisCombinationCurrentAccumulation,myRoute,elephantRoute,thisCombinationValvesOpenened,thisCombinationOverlap, thisCombinationRouteReport];
//     }
//   }
// }


// console.log(maxRelease, bestRouteCombination);
// console.log(bestRouteReport);
//
// console.dir(leastOverlapsCombination, {depth:null})
// console.log(allCombs);
// console.log(maxRelease);
// let bestI = null;
// let bestJ = null;
// let currentMaxOverlap = Infinity;
// let currentBestScore = 0;
//
// for(let i in overlaps) {
//   for(let j of overlaps[i]) {
//     if(overlaps[i][j] < currentMaxOverlap) {
//       bestI = i;
//       bestJ = j;
//       currentMaxOverlap = overlaps[i][j];
//     }
//   }
// }
// console.log(bestI, bestJ, currentMaxOverlap);
// console.log(overlaps[bestI][bestJ]);
// const myRoute = allRoutes[bestI];
// const elephantRoute = allRoutes[bestJ];
// console.log(myRoute, elephantRoute);
// console.log(currentMaxOverlap);
// console.log(myRoute.release + elephantRoute.release);

//
// let currentHeighest = 0;
//
// // console.dir(allRoutes, {depth: null});
// for(let i =0; i < 2; i++) {
//   const humanRoute = allRoutes[i].route;
//   const accumulatedRelease = 0;
//   const currentELephantValve = 'AA';
//
//   for(let routeStep of humanRoute) {
//     console.log(routeStep);
//     const accumulatedRelease = routeStep.thisRelease;
//
//     const elephantsRelease = findHighestPressureReleasePath('A')
//   }
//
//   for(let j=1; j<2; j++) {
//     if(j===i) continue; //cant walk the sam eroute
//
//
//
//   }
// }
