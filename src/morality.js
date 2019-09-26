'use strict';

const primalSolver = require('./primal-solver.js');
const dualSolver = require('./dual-solver.js');

function solve(mdp, ethicalContext, moralPrinciple, usePrimalForm = true) {
  if (usePrimalForm) {
    return primalSolver.solve(mdp, ethicalContext);
  }
  return dualSolver.solve(mdp, ethicalContext);
}

module.exports = {
  solve,
};
