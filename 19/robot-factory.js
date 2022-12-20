const fs = require('fs');
const sampleData = fs.readFileSync('sample.txt', 'utf8');
const inputData = fs.readFileSync('input.txt', 'utf8');

String.prototype.toInt = function () {
  return parseInt(this,10);
}

class Blueprint
{
  id;
  costs;
  maxCosts;

  constructor(blueprintNum,
                oreRobotOreCost,
                clayRobotOreCost,
                obsidianRobotOreCost,
                obsidianRobotClayCost,
                geodeRobotOreCost,
                geodeRobotObsidianCost) {
    this.id = blueprintNum;
    this.costs = [
      [oreRobotOreCost, 0, 0, 0],
      [clayRobotOreCost, 0, 0, 0],
      [obsidianRobotOreCost, obsidianRobotClayCost, 0, 0],
      [geodeRobotOreCost, 0, geodeRobotObsidianCost, 0],
    ]
    this.maxCosts = this.defineMaxCosts();
  }

  defineMaxCosts()  {
    return [
      Math.max(...[this.costs[0][0], this.costs[1][0], this.costs[2][0], this.costs[3][0]]), // Max Ore needed for any robot
      Math.max(...[this.costs[0][1], this.costs[1][1], this.costs[2][1], this.costs[3][1]]),// Max Clay needed for any robot
      Math.max(...[this.costs[0][2], this.costs[1][2], this.costs[2][2], this.costs[3][2]]),// Max Obsidian needed for any robot
      Infinity
    ];
  }

  getMaxCostToBuildRobot(type) {
    return this.maxCosts[type];
  }

  getRobotCosts(robot) {
    return this.costs[robot];
  }

}

const parseBlueprint = (line) => {
  const [
    blueprintNum,
    oreRobotOreCost,
    clayRobotOreCost,
    obsidianRobotOreCost,
    obsidianRobotClayCost,
    geodeRobotOreCost,
    geodeRobotObsidianCost,
  ] =  Array.from(line.matchAll(/(\d+)/g)).map(
    (regExpMatchArray) => regExpMatchArray[1].toInt()
  );
  return new Blueprint(
    blueprintNum,
    oreRobotOreCost,
    clayRobotOreCost,
    obsidianRobotOreCost,
    obsidianRobotClayCost,
    geodeRobotOreCost,
    geodeRobotObsidianCost
  );
};

class FactoryRun {
  resources;
  robots;
  currentMinute;
  numMinutes

  constructor(resources, robots, currentMinute, numMinutes) {
    this.resources = resources;
    this.robots = robots;
    this.currentMinute = currentMinute;
    this.numMinutes = numMinutes;
  }

  maxGeodesICanCrack() {
    // The amount of geodes this factory can crack is the amount of cracked geodes we have,
    // plus the amount of geode robots we have times the number of minutes left
    // E.g. with 2 robots and 10 minutes, we can crack 20 geodes
    return this.resources[3] + (this.robots[3] * (this.numMinutes - this.currentMinute));
  }

}

const getBlueprintMaximumGeodeCrackAmount = (blueprint, numMinutes = 24) => {
  let currentMaxCrackableGeodes = 0;
  const runs = [];

  // Starting state:
  runs.push(
    new FactoryRun(
      [0,0,0,0],
      [1,0,0,0],
      0,
      numMinutes
    )
  );

  do {
    const thisRun = runs.pop();
    const currentMinute = thisRun.currentMinute + 1;
    const robots = thisRun.robots;
    const resources = thisRun.resources;

    // Amount of geode and amount of geode robots
    const thisRunMaxCrackableGeodes = thisRun.maxGeodesICanCrack();
    if(thisRunMaxCrackableGeodes > currentMaxCrackableGeodes) {
      currentMaxCrackableGeodes = thisRunMaxCrackableGeodes;
    }

    if(currentMinute === numMinutes) continue; // This run has run out of minutes
    const timeLeft = numMinutes - currentMinute;

    for (let type in robots) {

      // We can only build _one_ robot per run (minute)!

      // So if we have more than enough of that resource already, don't bother building that robot!
      // Using the max amount +2 here as cut off, seems to work best:
      if (resources[type] > (blueprint.getMaxCostToBuildRobot(type)+1)) {
        continue;
      }

      const thisRobotCosts = blueprint.getRobotCosts(type);

      // Get the max time to gather resources, i.e. the highest amount counts
      const timeToGatherResourcesForThisRobot = resources.map((currentAmount, resourceType) => {
        const resourcesStillNeededForThisRobot = thisRobotCosts[resourceType] - currentAmount;
        if(resourcesStillNeededForThisRobot <= 0) {
          return 0;
        }

        const numRobotsWeHaveToGatherThisResource = robots[resourceType]; // Every robot can do one per minute
        if(numRobotsWeHaveToGatherThisResource === 0) {
          return Infinity;
        }

        return Math.ceil(resourcesStillNeededForThisRobot / numRobotsWeHaveToGatherThisResource);
      }).reduce((acc, curr) => {
        return curr > acc ? curr : acc;
      });

      if(timeToGatherResourcesForThisRobot > timeLeft) {
        // We cannot build this robot any time soon
        continue;
      }

      // Looks like we can build this robot in time, let's define the next run

      // Define the new resource amounts:
      const newRunResources = resources.map((curr, j) => {
        return curr + // Current amount of this resource
            robots[j] * (timeToGatherResourcesForThisRobot + 1) // The amount of robots and the needed time per robot,
                                                                // plus 1 minute to build those robots
          -  (thisRobotCosts[j]); // Minus the cost of the robot we're building
      });

      // Define the new robot amounts (the same plus one of the current type added)
      const newRobots = robots.map((curr, k) => {
        return curr +((type.toInt()===k) ? 1:0)
      });

      // Add the number of minutes we need to gather all resources
      const newMinute = currentMinute + timeToGatherResourcesForThisRobot;

      // Add this run to our runs list
      runs.push(
        new FactoryRun(
          newRunResources,
          newRobots,
          newMinute,
          numMinutes
        )
      );
    }
  } while (runs.length > 0);

  return currentMaxCrackableGeodes;
};

const getBlueprintQualityLevelSum = (inputData, numMinutes) => {
  const blueprints = inputData.split('\n').map(parseBlueprint);
  let qualityLevelSum = blueprints.reduce((acc, blueprint) => {
    const score = getBlueprintMaximumGeodeCrackAmount(blueprint, numMinutes);
    const qualityLevel = score * blueprint.id;
    return acc + qualityLevel;
  }, 0);

  return qualityLevelSum;
}

// Part 1
const qualityLevelSum = getBlueprintQualityLevelSum(inputData, 24);
console.log(qualityLevelSum);

// Part 2
const getBluePrintsScoreProduct = (inputData, numBluePrints, numMinutes) => {
  const blueprints = inputData.split('\n').slice(0, numBluePrints).map(parseBlueprint);
  const scores = blueprints.map((blueprint) => {
    return getBlueprintMaximumGeodeCrackAmount(blueprint, numMinutes);
  });
  const product = scores.reduce((acc, curr) => acc*curr, 1);
  return product;
}

const blueprintsScoreProduct = getBluePrintsScoreProduct(inputData, 3, 32);
console.log(blueprintsScoreProduct);