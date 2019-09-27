'use strict';

const GridMdp = require('./grid-mdp.js');
const morality = require('./morality.js');
const utils = require('./utils.js');

const grid = utils.getGrid('grids/simple-1x4.grid');
const mdp = new GridMdp(grid, 0.99);

console.log('Primal Policy');
const primalPolicy = morality.solve(mdp, null, null, true);
console.log(primalPolicy);

console.log();

console.log('Dual Policy');
const dualPolicy = morality.solve(mdp, null, null, false);
console.log(dualPolicy);
