'use strict';

const city = require('./map.json');
const morality = require('../morality.js');
const SelfDrivingCarAgent = require('../agents/self-driving-car-agent.js');
const VirtueEthics = require('../ethics/virtue-ethics.js');
const experimentHandler = require('./experiment_handler.js');

const START_LOCATION = process.argv[2].toUpperCase();
const GOAL_LOCATION = process.argv[3].toUpperCase();
const IS_VERBOSE = process.argv[4] === 'true';

city['startLocations'] = [START_LOCATION];
city['goalLocation'] = GOAL_LOCATION;
const agent = new SelfDrivingCarAgent(city);

const fewMoralTrajectories = [
  [['NORTH_PLEASANT_STREET_SOUTH_CITY_NONE_EMPTY'], ['ACCELERATE_TO_NORMAL_SPEED']]
];
const manyMoralTrajectories = [
  [['NORTH_PLEASANT_STREET_SOUTH_CITY_NONE_EMPTY'], ['ACCELERATE_TO_NORMAL_SPEED']],
  [['EAST_PLEASANT_STREET_WEST_CITY_NONE_EMPTY'], ['ACCELERATE_TO_HIGH_SPEED']],
  [['TRIANGLE_STREET_SOUTH_CITY_NONE_EMPTY'], ['ACCELERATE_TO_LOW_SPEED']]
];

const fewVe = new VirtueEthics(fewMoralTrajectories);
const manyVe = new VirtueEthics(manyMoralTrajectories);

const amoralSolution = morality.solve(agent, null, true);
const fewVeSolution = morality.solve(agent, fewVe, true);
const manyVeSolution = morality.solve(agent, manyVe, true);

if (IS_VERBOSE) {
  if (amoralSolution) {
    console.log('Amoral Policy');
    console.log(JSON.stringify(amoralSolution.policy));
  }

  if (fewVeSolution) {
    console.log('Few VE Moral Policy');
    console.log(JSON.stringify(fewVeSolution.policy));
  }

  if (manyVeSolution) {
    console.log('Many VE Moral Policy');
    console.log(JSON.stringify(manyVeSolution.policy));
  }
}

const fewVePriceOfMorality = fewVeSolution.objective - amoralSolution.objective;
const manyVePriceOfMorality = manyVeSolution.objective - amoralSolution.objective;

const fewVeValueLoss = (fewVePriceOfMorality / amoralSolution.objective) * 100;
const manyVeValueLoss = (manyVePriceOfMorality / amoralSolution.objective) * 100;

experimentHandler.print([
  ['Ethics', 'Settings', 'Value (s)', 'Price of Morality (s)', 'Value Loss (%)'],
  ['None', '---', amoralSolution.objective, 0, 0],
  ['VE', 'Small', fewVeSolution.objective, fewVePriceOfMorality, fewVeValueLoss],
  ['VE', 'Large', manyVeSolution.objective, manyVePriceOfMorality, manyVeValueLoss]
]);
