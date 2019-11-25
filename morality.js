'use strict';

const solver = require('./solvers/dual-solver.js');

function solve(agent, ethics) {
  return solver.solve(agent, ethics);
}

module.exports = {
  solve
};
