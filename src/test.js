'use strict';

const morality = require('./morality.js');
const GridWorldMdp = require('./mdps/grid-world-mdp.js');
const ForbiddenStateEthics = require('./ethics/forbidden-state-ethics.js');
const helper = require('./utils/helper.js');
const printer = require('./utils/printer.js');

function test() {
  console.log('Grid');
  const gridWorld = helper.getJson('grid-worlds/6x10-grid-world.json');
  printer.printGridWorld(gridWorld);

  console.log();

  const agent = new GridWorldMdp(gridWorld);
  const ethics = new ForbiddenStateEthics([26]);

  console.log('Amoral Policy');
  const amoralPolicy = morality.solve(agent);
  printer.printPolicy(amoralPolicy, gridWorld);

  console.log();

  console.log('Moral Policy');
  const moralPolicy = morality.solve(agent, ethics);
  printer.printPolicy(moralPolicy, gridWorld, ethics);
}

test();
