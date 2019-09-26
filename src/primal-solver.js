'use strict';

const solver = require('javascript-lp-solver');

function getConstraints(mdp) {
  const constraints = {};

  for (const state of mdp.states) {
    for (const action of mdp.actions) {
      constraints['state' + state + action] = {'min': mdp.rewardFunction(state, action)};
    }
  }

  return constraints;
}

function getVariables(mdp) {
  const variables = {};

  for (const state of mdp.states) {
    variables['state' + state] = {'value': 1};

    for (const newState of mdp.states) {
      for (const action of mdp.actions) {
        if (state == newState) {
          variables['state' + state]['state' + newState + action] = 1 - mdp.transitionFunction(newState, action, state);
        } else {
          variables['state' + state]['state' + newState + action] = -mdp.transitionFunction(newState, action, state);
        }
        variables['state' + state]['state' + newState + action] *= mdp.discountFactor;
      }
    }
  }

  return variables;
}

function getProgram(mdp) {
  return {
    'optimize': 'value',
    'opType': 'min',
    'constraints': getConstraints(mdp),
    'variables': getVariables(mdp),
  };
}

function solve(mdp) {
  const program = getProgram(mdp);
  return solver.Solve(program);
}

module.exports = {
  getConstraints,
  getVariables,
  getProgram,
  solve,
};
