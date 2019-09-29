'use strict';

const morality = require('./morality.js');
const GridMdp = require('./mdps/grid-mdp.js');
const ForbiddenStateEthicalContext = require('./ethical-contexts/forbidden-state-ethical-context.js');
const helper = require('./utils/helper.js');
const printer = require('./utils/printer.js');

function test() {
  const grid = helper.getJson('grids/8x10-grid.json');
  const mdp = new GridMdp(grid);

  const ethicalContext = new ForbiddenStateEthicalContext([]);

  const discountFactor = 0.99;

  console.log('Primal Policy');
  const primalPolicy = morality.solve(mdp, ethicalContext, discountFactor, true);
  printer.printPolicy(grid, ethicalContext, primalPolicy);

  console.log();

  console.log('Dual Policy');
  const dualPolicy = morality.solve(mdp, ethicalContext, discountFactor, false);
  printer.printPolicy(grid, ethicalContext, dualPolicy);
}

test();
