'use strict';

const morality = require('../morality.js');
const GridWorldAgent = require('../agents/grid-world-agent.js');
const MoralExemplarEthics = require('../ethics/moral-exemplar-ethics.js');
const helper = require('../utils/helper.js');
const printer = require('../utils/printer.js');

const gridWorld = helper.getJson('grid-world.json');
const agent = new GridWorldAgent(gridWorld);

const ethics = new MoralExemplarEthics([
  [[1], ['NORTH']],
  [[2], ['NORTH']]
]);

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