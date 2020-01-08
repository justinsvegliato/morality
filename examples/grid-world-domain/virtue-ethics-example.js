'use strict';

const morality = require('../../morality.js');
const GridWorldAgent = require('../../agents/grid-world-agent.js');
const VirtueEthics = require('../../ethics/virtue-ethics.js');
const printer = require('../../utils/printer.js');

const gridWorld = [
  ['O', 'O', 'W', 'W', 'O', 'O', 'O', 'W', 'O', 'O', 'O', 'O'],
  ['O', 'O', 'W', 'W', 'O', 'W', 'O', 'W', 'O', 'W', 'O', 'O'],
  ['O', 'O', 'W', 'W', 'O', 'W', 'O', 'O', 'O', 'W', 'O', 'O'],
  ['O', 'O', 'O', 'O', 'O', 'W', 'W', 'W', 'W', 'W', 'O', 'O'],
  ['O', 'O', 'W', 'W', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O'],
  ['O', 'O', 'O', 'O', 'O', 'W', 'W', 'W', 'W', 'W', 'G', 'O']
];
const agent = new GridWorldAgent(gridWorld);

const ethics = new VirtueEthics([
  [[0], ['WEST']],
  [[1], ['NORTH']]
]);

console.log('Domain');
printer.printGridWorldDomain(gridWorld, ethics);

console.log('Amoral Policy');
const amoralSolution = morality.solve(agent);
if (amoralSolution) {
  printer.printGridWorldPolicy(gridWorld, amoralSolution.policy);
}

console.log('Moral Policy');
const moralSolution = morality.solve(agent, ethics);
if (moralSolution) {
  printer.printGridWorldPolicy(gridWorld, moralSolution.policy);
}
