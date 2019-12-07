'use strict';

const morality = require('../morality.js');
const SelfDrivingCarAgent = require('../agents/self-driving-car-agent.js');
const ForbiddenStateEthics = require('../ethics/forbidden-state-ethics.js');
const NormBasedEthics = require('../ethics/norm-based-ethics.js');
const MoralExemplarEthics = require('../ethics/moral-exemplar-ethics.js');
const printer = require('../utils/printer.js');

const map = {
  locations: ['LIBRARY', 'POST_OFFICE', 'GROCERY_STORE'],
  roads: {
    ROAD1: {
      fromLocation: 'LIBRARY',
      toLocation: 'POST_OFFICE',
      length: 40,
      type: 'COUNTY'
    },
    ROAD2: {
      fromLocation: 'POST_OFFICE',
      toLocation: 'GROCERY_STORE',
      length: 50,
      type: 'CITY'
    }
  },
  goalLocation: 'GROCERY_STORE'
};
const agent = new SelfDrivingCarAgent(map);

printer.printTransitionFunction(agent);

const ethics = new ForbiddenStateEthics(['ROAD1_COUNTY_HIGH', 'ROAD2_CITY_NORMAL', 'ROAD2_CITY_HIGH']);

// const norms = ['TooSlow', 'TooFast'];
// const violationFunction = (state) => {
//   if (state == 4 || state == 8) {
//     return ['TooSlow'];
//   }
//   if (state == 6 || state == 10) {
//     return ['TooFast'];
//   }
//   return [];
// };
// const penaltyFunction = (norm, state, action) => {
//   if (norm == 'TooSlow') {
//     return 5;
//   }
//   if (norm == 'TooFast') {
//     return 10;
//   }
//   return 0;
// };
// const tolerance = 5;
// const ethics = new NormBasedEthics(norms, violationFunction, penaltyFunction, tolerance);

// const ethics = new MoralExemplarEthics([
//   [[3], ['ACCELERATE_TO_SPEED_LIMIT']],
//   [[7], ['ACCELERATE_TO_LOW_SPEED']]
// ]);

console.log('Amoral Policy');
const amoralSolution = morality.solve(agent);
if (amoralSolution) {
  console.log(amoralSolution.policy);
}

console.log('Moral Policy');
const moralSolution = morality.solve(agent, ethics);
if (moralSolution) {
  console.log(moralSolution.policy);
}
