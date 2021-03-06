'use strict';

const map = require('./maps/map.json');
const morality = require('../morality.js');
const SelfDrivingCarAgent = require('../agents/self-driving-car-agent.js');
const DivineCommandTheory = require('../ethics/divine-command-theory.js');
const experimentHandler = require('./experiment_handler.js');

const START_LOCATION = process.argv[2].toUpperCase();
const GOAL_LOCATION = process.argv[3].toUpperCase();
const IS_VERBOSE = process.argv[4] === 'true';

map['startLocations'] = [START_LOCATION];
map['goalLocation'] = GOAL_LOCATION;
const agent = new SelfDrivingCarAgent(map);

const fewForbiddenStates = agent.states().filter((state) => {
  const information = agent.interpret(state);
  const isSpeeding = information.speed == 'HIGH';
  return isSpeeding;
});
const manyForbiddenStates = agent.states().filter((state) => {
  const information = agent.interpret(state);
  const isSpeeding = information.speed == 'HIGH';
  const isUncareful = information.speed == 'NORMAL' && information.pedestrianTraffic == 'HEAVY';
  return isSpeeding || isUncareful;
});

const fewDct = new DivineCommandTheory(fewForbiddenStates);
const manyDct = new DivineCommandTheory(manyForbiddenStates);

const amoralSolution = morality.solve(agent, null, true);
const fewDctSolution = morality.solve(agent, fewDct, true);
const manyDctSolution = morality.solve(agent, manyDct, true);

if (IS_VERBOSE) {
  if (amoralSolution) {
    console.log('Amoral Policy');
    console.log(JSON.stringify(amoralSolution.policy));
    console.log();
  }

  if (fewDctSolution) {
    console.log('Few DCT Moral Policy');
    console.log(JSON.stringify(fewDctSolution.policy));
    console.log();
  }

  if (manyDctSolution) {
    console.log('Many DCT Moral Policy');
    console.log(JSON.stringify(manyDctSolution.policy));
    console.log();
  }
}

const fewDctPriceOfMorality = fewDctSolution.objective - amoralSolution.objective;
const manyDctPriceOfMorality = manyDctSolution.objective - amoralSolution.objective;

const fewDctValueLoss = (fewDctPriceOfMorality / amoralSolution.objective) * 100;
const manyDctValueLoss = (manyDctPriceOfMorality / amoralSolution.objective) * 100;

experimentHandler.print([
  ['Ethics', 'Settings', 'Value (s)', 'Price of Morality (s)', 'Loss (%)'],
  ['None', '---', amoralSolution.objective, 0, 0],
  ['DCT', 'H', fewDctSolution.objective, fewDctPriceOfMorality, fewDctValueLoss],
  ['DCT', 'H or I', manyDctSolution.objective, manyDctPriceOfMorality, manyDctValueLoss]
]);
