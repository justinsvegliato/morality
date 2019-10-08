'use strict';

const morality = require('../morality.js');
const GridWorldAgent = require('../agents/grid-world-agent.js');
const NonmyopicNormBasedEthics = require('../ethics/nonmyopic-norm-based-ethics.js');
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
    return 5;
  }
  return 0;
};
const tolerance = 2;
const ethics = new NonmyopicNormBasedEthics(norms, violationFunction, penaltyFunction, tolerance);

console.log('Domain');
printer.printDomain(gridWorld, ethics);

console.log('Amoral Policy');
const amoralPolicy = morality.solve(agent);
if (amoralPolicy) {
  printer.printPolicy(amoralPolicy, gridWorld);
}

console.log('Moral Policy');
const moralPolicy = morality.solve(agent, ethics);
if (moralPolicy) {
  printer.printPolicy(moralPolicy, gridWorld, ethics);
}
