'use strict';

const map = require('./maps/map.json');
const morality = require('../morality.js');
const SelfDrivingCarAgent = require('../agents/self-driving-car-agent.js');
const PrimaFacieDuties = require('../ethics/prima-facie-duties.js');
const experimentHandler = require('./experiment_handler.js');

const START_LOCATION = process.argv[2].toUpperCase();
const GOAL_LOCATION = process.argv[3].toUpperCase();
const IS_VERBOSE = process.argv[4] === 'true';

map['startLocations'] = [START_LOCATION];
map['goalLocation'] = GOAL_LOCATION;
const agent = new SelfDrivingCarAgent(map);

const duties = ['HESITANT_OPERATION', 'RECKLESS_OPERATION'];
const violationFunction = (state) => {
  const information = agent.interpret(state);
  if (information.speed == 'HIGH') {
    return ['RECKLESS_OPERATION'];
  }
  if (information.speed == 'NORMAL' && information.pedestrianTraffic == 'HEAVY') {
    return ['RECKLESS_OPERATION'];
  }
  if (information.speed == 'LOW' && information.pedestrianTraffic == 'LIGHT') {
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
    if (information.speed == 'HIGH' && information.pedestrianTraffic == 'HEAVY') {
      return 30;
    }
    if (information.speed == 'HIGH' && information.pedestrianTraffic == 'LIGHT') {
      return 7.5;
    }
    if (information.speed == 'NORMAL' && information.pedestrianTraffic == 'HEAVY') {
      return 15;
    }
  }
  return 0;
};
const lowTolerance = 3;
const mediumTolerance = 6;
const highTolerance = 9;

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
    console.log();
  }

  if (lowPfdSolution) {
    console.log('Few PFD Moral Policy');
    console.log(JSON.stringify(lowPfdSolution.policy));
    console.log();
  }

  if (mediumPfdSolution) {
    console.log('Medium PFD Moral Policy');
    console.log(JSON.stringify(mediumPfdSolution.policy));
    console.log();
  }

  if (highPfdSolution) {
    console.log('High PFD Moral Policy');
    console.log(JSON.stringify(highPfdSolution.policy));
  }
  console.log();
}

const lowPfdPriceOfMorality = lowPfdSolution.objective - amoralSolution.objective;
const mediumPfdPriceOfMorality = mediumPfdSolution.objective - amoralSolution.objective;
const highPfdPriceOfMorality = highPfdSolution.objective - amoralSolution.objective;

const lowPfdValueLoss = (lowPfdPriceOfMorality / amoralSolution.objective) * 100;
const mediumPfdValueLoss = (mediumPfdPriceOfMorality / amoralSolution.objective) * 100;
const highPfdValueLoss = (highPfdPriceOfMorality / amoralSolution.objective) * 100;

experimentHandler.print([
  ['Ethics', 'Settings', 'Value (s)', 'Price of Morality (s)', 'Loss (%)'],
  ['None', '---', amoralSolution.objective, 0, 0],
  ['PFD', 'e = 3', lowPfdSolution.objective, lowPfdPriceOfMorality, lowPfdValueLoss],
  ['PFD', 'e = 6', mediumPfdSolution.objective, mediumPfdPriceOfMorality, mediumPfdValueLoss],
  ['PFD', 'e = 9', highPfdSolution.objective, highPfdPriceOfMorality, highPfdValueLoss]
]);
