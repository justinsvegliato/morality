'use strict';

const GridMdp = require('./mdps/grid-mdp.js');
const morality = require('./morality.js');
const helper = require('./utils/helper.js');
const printer = require('./utils/printer.js');

const grid = helper.getJson('grids/simple-4x5-grid.json');
const mdp = new GridMdp(grid);

printer.printTransitionFunction(mdp);

const discountFactor = 0.99;

console.log('Primal Policy');
const primalPolicy = morality.solve(mdp, discountFactor, true);
console.log(primalPolicy);

for (let i = 0; i < grid.height; i++) {
  let stringRow = '|';
  for (let j = 0; j < grid.width; j++) {
    const state = grid.width * i + j;
    stringRow += grid.map[i][j] == 'W' ? 'W|' : primalPolicy[state][0] + '|';
  }
  console.log(stringRow);
}

console.log();

console.log('Dual Policy');
const dualPolicy = morality.solve(mdp, discountFactor, false);
console.log(dualPolicy);

for (let i = 0; i < grid.height; i++) {
  let stringRow = '';
  for (let j = 0; j < grid.width; j++) {
    const state = grid.width * i + j;
    stringRow += grid.map[i][j] == 'W' ? 'W' : dualPolicy[state][0];
  }
  console.log(stringRow);
}
