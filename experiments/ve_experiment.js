'use strict';

const map = require('./maps/map.json');
const morality = require('../morality.js');
const SelfDrivingCarAgent = require('../agents/self-driving-car-agent.js');
const VirtueEthics = require('../ethics/virtue-ethics.js');
const experimentHandler = require('./experiment_handler.js');

const START_LOCATION = process.argv[2].toUpperCase();
const GOAL_LOCATION = process.argv[3].toUpperCase();
const IS_VERBOSE = process.argv[4] === 'true';

map['startLocations'] = [START_LOCATION];
map['goalLocation'] = GOAL_LOCATION;
const agent = new SelfDrivingCarAgent(map);

const fewMoralTrajectories = [];
for (const state of agent.states()) {
  const information = agent.interpret(state);
  if (information.length > 0) {
    fewMoralTrajectories.push([[`${information.name}_${information.type}_NONE_EMPTY`], ['ACCELERATE_TO_NORMAL_SPEED']]);
    fewMoralTrajectories.push([[`${information.name}_${information.type}_NONE_BUSY`], ['ACCELERATE_TO_LOW_SPEED']]);
  }
}

const manyMoralTrajectories = fewMoralTrajectories.concat([
  [['GAS_STATION'], ['STAY']],
  [['GAS_STATION'], ['TURN_ONTO_ROUTE_116']],
  [['GAS_STATION'], ['TURN_ONTO_SERVICE_ROAD_REVERSED']],
  [['GAS_STATION'], ['TURN_ONTO_COLLEGE_STREET_REVERSED']],
  [['OFFICE'], ['STAY']],
  [['OFFICE'], ['TURN_ONTO_ROUTE_9']],
  [['OFFICE'], ['TURN_ONTO_OAK_ROAD_REVERSED']],
  [['HOME'], ['STAY']],
  [['HOME'], ['TURN_ONTO_GRAY_STREET']],
  [['TRAIN_STATION'], ['STAY']],
  [['TRAIN_STATION'], ['TURN_ONTO_GRAY_STREET_REVERSED']],
  [['TRAIN_STATION'], ['TURN_ONTO_MERRICK_ROAD']],
  [['TRAIN_STATION'], ['TURN_ONTO_SERVICE_ROAD']],
  [['CAFE'], ['STAY']],
  [['CAFE'], ['TURN_ONTO_MAIN_STREET']]
]);

const fewVe = new VirtueEthics(fewMoralTrajectories);
const manyVe = new VirtueEthics(manyMoralTrajectories);

const amoralSolution = morality.solve(agent, null, true);
const fewVeSolution = morality.solve(agent, fewVe, true);
const manyVeSolution = morality.solve(agent, manyVe, true);

if (IS_VERBOSE) {
  if (amoralSolution) {
    console.log('Amoral Policy');
    console.log(JSON.stringify(amoralSolution.policy));
    console.log();
  }

  if (fewVeSolution) {
    console.log('Few VE Moral Policy');
    console.log(JSON.stringify(fewVeSolution.policy));
    console.log();
  }

  if (manyVeSolution) {
    console.log('Many VE Moral Policy');
    console.log(JSON.stringify(manyVeSolution.policy));
    console.log();
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
