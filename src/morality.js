'use strict';

const primalSolver = require('./solvers/primal-solver.js');
const dualSolver = require('./solvers/dual-solver.js');

function solve(mdp, ethicalContext, discountFactor, usePrimalForm = true) {
  if (usePrimalForm) {
    return primalSolver.solve(mdp, discountFactor);
  }
  return dualSolver.solve(mdp, ethicalContext, discountFactor);
}

module.exports = {
  solve
};
