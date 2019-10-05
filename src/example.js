'use strict';

const morality = require('morality');
const GridWorldAgent = require('./agents/grid-world-agent');
const ForbiddenStateEthics = require('./ethics/forbidden-state-ethics');
const helper = require('./utils/helper.js');
const printer = require('./utils/printer.js');

console.log('Grid World');
const gridWorld = helper.getJson('grid-worlds/6x10-grid-world.json');
printer.printGridWorld(gridWorld);

const agent = new GridWorldAgent(gridWorld);
const ethics = new ForbiddenStateEthics([2]);

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
