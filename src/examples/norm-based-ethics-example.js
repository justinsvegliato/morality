'use strict';

const morality = require('../morality.js');
const GridWorldAgent = require('../agents/grid-world-agent.js');
const NormBasedEthics = require('../ethics/norm-based-ethics.js');
const helper = require('../utils/helper.js');
const printer = require('../utils/printer.js');

const gridWorld = helper.getJson('grid-world.json');
const agent = new GridWorldAgent(gridWorld);

const norms = ['Do Not Yell', 'Do Not Lie'];
const violationFunction = (state) => {
  if (state == 55) {
    return ['Do Not Yell', 'Do Not Lie'];
  }
  return [];
};
const penaltyFunction = (norm, state, action) => {
  if (norm == 'Do Not Yell') {
    return 1;
  }
  if (norm == 'Do Not Lie') {
    return 10;
  }
  return 0;
};
const tolerance = 0.1;
const ethics = new NormBasedEthics(norms, violationFunction, penaltyFunction, tolerance);

console.log('Domain');
printer.printDomain(gridWorld, ethics);

console.log('Amoral Policy');
const amoralSolution = morality.solve(agent);
if (amoralSolution) {
  printer.printPolicy(amoralSolution.policy, gridWorld);
}

console.log('Moral Policy');
const moralSolution = morality.solve(agent, ethics);
if (moralSolution) {
  printer.printPolicy(moralSolution.policy, gridWorld, ethics);
}
