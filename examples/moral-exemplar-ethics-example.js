'use strict';

const morality = require('../morality.js/index.js.js');
const GridWorldAgent = require('../agents/grid-world-agent.js');
const MoralExemplarEthics = require('../ethics/moral-exemplar-ethics.js');
const printer = require('../utils/printer.js');

const gridWorld = {
  'width': 12,
  'height': 6,
  'grid': [
    ['O', 'O', 'W', 'W', 'O', 'O', 'O', 'W', 'O', 'O', 'O', 'O'],
    ['O', 'O', 'W', 'W', 'O', 'W', 'O', 'W', 'O', 'W', 'O', 'O'],
    ['O', 'O', 'W', 'W', 'O', 'W', 'O', 'O', 'O', 'W', 'O', 'O'],
    ['O', 'O', 'O', 'O', 'O', 'W', 'W', 'W', 'W', 'W', 'O', 'O'],
    ['O', 'O', 'W', 'W', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O'],
    ['O', 'O', 'O', 'O', 'O', 'W', 'W', 'W', 'W', 'W', 'G', 'O']
  ]
};
const agent = new GridWorldAgent(gridWorld);

const ethics = new MoralExemplarEthics([
  [[0], ['WEST']],
  [[1], ['NORTH']]
]);

console.log('Domain');
printer.printDomain(agent, ethics);

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
