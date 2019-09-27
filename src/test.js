'use strict';

const GridMdp = require('./grid-mdp.js');
const morality = require('./morality.js');
const utils = require('./utils.js');

const grid = utils.getGrid('grids/simple-2x2-grid.json');
const mdp = new GridMdp(grid);

const discountFactor = 0.99;

console.log('Primal Policy');
const primalPolicy = morality.solve(mdp, discountFactor, true);
console.log(primalPolicy);

console.log();

console.log('Dual Policy');
const dualPolicy = morality.solve(mdp, discountFactor, false);
console.log(dualPolicy);
