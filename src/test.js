'use strict';

const GridMdp = require('./mdps/grid-mdp.js');
const morality = require('./morality.js');
const helper = require('./utils/helper.js');

const grid = helper.getJson('grids/simple-4x5-grid.json');
const mdp = new GridMdp(grid);

const discountFactor = 0.99;

console.log('Primal Policy');
const primalPolicy = morality.solve(mdp, discountFactor, true);
console.log(primalPolicy);

console.log();

console.log('Dual Policy');
const dualPolicy = morality.solve(mdp, discountFactor, false);
console.log(dualPolicy);
