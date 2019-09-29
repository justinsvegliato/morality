'use strict';

const ethics = require('./ethics.js');
const GridMdp = require('./mdps/grid-mdp.js');
const ForbiddenStateMorality = require('./morality/forbidden-state-morality.js');
const helper = require('./utils/helper.js');
const printer = require('./utils/printer.js');

function test() {
  console.log('Grid');
  const grid = helper.getJson('grids/7x7-grid.json');
  printer.printGrid(grid);

  console.log();

  const agent = new GridMdp(grid);
  const morality = new ForbiddenStateMorality([1, 2, 3, 4, 5, 15, 16, 17, 18, 19]);

  console.log('Amoral Policy');
  const amoralPolicy = ethics.solve(agent);
  printer.printPolicy(amoralPolicy, grid);

  console.log();

  console.log('Moral Policy');
  const moralPolicy = ethics.solve(agent, morality);
  printer.printPolicy(moralPolicy, grid, morality);
}

test();
