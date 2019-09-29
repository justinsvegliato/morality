'use strict';

const GridMdp = require('./mdps/grid-mdp.js');
const ForbiddenStateEthicalContext = require('./ethical-contexts/forbidden-state-ethical-context.js');
const morality = require('./morality.js');
const helper = require('./utils/helper.js');
const printer = require('./utils/printer.js');

const grid = helper.getJson('grids/simple-7x7-grid.json');
const mdp = new GridMdp(grid);

const ethicalContext = new ForbiddenStateEthicalContext([1, 2, 3, 4, 5, 15, 16, 17, 18, 19]);

const discountFactor = 0.99;

console.log('Primal Policy');
const primalPolicy = morality.solve(mdp, ethicalContext, discountFactor, true);
printer.printPolicy(grid, ethicalContext, primalPolicy);

console.log();

console.log('Dual Policy');
const dualPolicy = morality.solve(mdp, ethicalContext, discountFactor, false);
printer.printPolicy(grid, ethicalContext, dualPolicy);
