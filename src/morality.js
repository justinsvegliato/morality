'use strict';

const primalSolver = require('./primal-solver.js');
const dualSolver = require('./dual-solver.js');

function solve(mdp, ethicalContext, moralPrinciple, usePrimalForm = true) {
  if (usePrimalForm) {
    return primalSolver.solve(mdp);
  }
  return dualSolver.solve(mdp);
}

module.exports = {
  solve,
};
