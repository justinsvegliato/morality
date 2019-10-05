'use strict';

const morality = require('morality');
const GridWorldAgent = require('./agents/grid-world-agent');
const ForbiddenStateEthics = require('./ethics/forbidden-state-ethics');
const helper = require('./utils/helper.js');
const printer = require('./utils/printer.js');

const gridWorld = helper.getJson('grid-worlds/6x10-grid-world.json');

const agent = new GridWorldAgent(gridWorld);
const ethics = new ForbiddenStateEthics([2]);

const amoralPolicy = morality.solve(agent);
const moralPolicy = morality.solve(agent, ethics);

console.log('Grid World');
printer.printGridWorld(gridWorld);

console.log('Amoral Policy');
if (amoralPolicy) {
  printer.printPolicy(amoralPolicy, gridWorld);
}

console.log('Moral Policy');
if (moralPolicy) {
  printer.printPolicy(moralPolicy, gridWorld, ethics);
}
