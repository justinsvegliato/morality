'use strict';

const city = require('./map.json');
const morality = require('../morality.js');
const SelfDrivingCarAgent = require('../agents/self-driving-car-agent.js');
const PrimaFacieDuties = require('../ethics/prima-facie-duties.js');
const table = require('table').table;

const START_LOCATION = process.argv[2].toUpperCase();
const GOAL_LOCATION = process.argv[3].toUpperCase();
const IS_VERBOSE = process.argv[4] === 'true';

city['startLocations'] = [START_LOCATION];
city['goalLocation'] = GOAL_LOCATION;
const agent = new SelfDrivingCarAgent(city);

const duties = ['HESITANT_OPERATION', 'RECKLESS_OPERATION'];
const violationFunction = (state) => {
  const information = agent.interpret(state);
  if (information.speed == 'HIGH') {
    return ['RECKLESS_OPERATION'];
  }
  if (information.speed == 'NORMAL' && information.condition == 'BUSY') {
    return ['RECKLESS_OPERATION'];
  }
  if (information.speed == 'LOW' && information.condition == 'EMPTY') {
    return ['HESITANT_OPERATION'];
  }
  return [];
};
const penaltyFunction = (duty, state) => {
  const information = agent.interpret(state);
  if (duty == 'HESITANT_OPERATION') {
    return 1;
  }
  if (duty == 'RECKLESS_OPERATION') {
    if (information.speed == 'HIGH' && information.condition == 'BUSY') {
      return 30;
    }
    if (information.speed == 'HIGH' && information.condition == 'EMPTY') {
      return 7.5;
    }
    if (information.speed == 'NORMAL' && information.condition == 'BUSY') {
      return 15;
    }
  }
  return 0;
};
const lowTolerance = 2;
const mediumTolerance = 10;
const highTolerance = 15;

const lowPfd = new PrimaFacieDuties(duties, violationFunction, penaltyFunction, lowTolerance);
const mediumPfd = new PrimaFacieDuties(duties, violationFunction, penaltyFunction, mediumTolerance);
const highPfd = new PrimaFacieDuties(duties, violationFunction, penaltyFunction, highTolerance);

const amoralSolution = morality.solve(agent, null, true);
const lowPfdSolution = morality.solve(agent, lowPfd, true);
const mediumPfdSolution = morality.solve(agent, mediumPfd, true);
const highPfdSolution = morality.solve(agent, highPfd, true);

if (IS_VERBOSE) {
  if (amoralSolution) {
    console.log('Amoral Policy');
    console.log(JSON.stringify(amoralSolution.policy));
  }

  if (fewDctSolution) {
    console.log('Few DCT Moral Policy');
    console.log(JSON.stringify(fewDctSolution.policy));
  }

  if (manyDctSolution) {
    console.log('Many DCT Moral Policy');
    console.log(JSON.stringify(manyDctSolution.policy));
  }
}

console.log(table([
  ['PFD', 'Value (s)', 'Price of Morality (s)'],
  ['None', Math.abs(amoralSolution.objective).toFixed(2), 0],
  ['Low', Math.abs(lowPfdSolution.objective).toFixed(2), Math.abs(lowPfdSolution.objective - amoralSolution.objective).toFixed(2)],
  ['Medium', Math.abs(mediumPfdSolution.objective).toFixed(2), Math.abs(mediumPfdSolution.objective - amoralSolution.objective).toFixed(2)],
  ['High', Math.abs(highPfdSolution.objective).toFixed(2), Math.abs(highPfdSolution.objective - amoralSolution.objective).toFixed(2)]
]));
