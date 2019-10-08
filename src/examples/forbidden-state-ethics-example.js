'use strict';

const morality = require('../morality.js');
const GridWorldAgent = require('../agents/grid-world-agent.js');
const ForbiddenStateEthics = require('../ethics/forbidden-state-ethics.js');
const helper = require('../utils/helper.js');
const printer = require('../utils/printer.js');

const gridWorld = helper.getJson('grid-world.json');
const agent = new GridWorldAgent(gridWorld);
const ethics = new ForbiddenStateEthics([55]);

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
