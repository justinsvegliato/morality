'use strict';

const morality = require('./morality.js');
const GridMdp = require('./mdps/grid-mdp.js');
const ForbiddenStateEthics = require('./ethics/forbidden-state-ethics.js');
const helper = require('./utils/helper.js');
const printer = require('./utils/printer.js');

function test() {
  console.log('Grid');
  const grid = helper.getJson('grids/7x7-grid.json');
  printer.printGrid(grid);

  console.log();

  const agent = new GridMdp(grid);
  const ethics = new ForbiddenStateEthics([1, 2, 3, 4, 5, 15, 16, 17, 18, 19]);

  console.log('Amoral Policy');
  const amoralPolicy = morality.solve(agent);
  printer.printPolicy(amoralPolicy, grid);

  console.log();

  console.log('Moral Policy');
  const moralPolicy = morality.solve(agent, ethics);
  printer.printPolicy(moralPolicy, grid, ethics);
}

test();
