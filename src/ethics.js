'use strict';

const solver = require('./solvers/dual-solver.js');

function solve(agent, morality) {
  return solver.solve(agent, morality);
}

module.exports = {
  solve
};
