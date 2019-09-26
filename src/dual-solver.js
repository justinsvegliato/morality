'use strict';

const solver = require('javascript-lp-solver');

function getConstraints(mdp) {
  const constraints = {};

  for (const successorState of mdp.states) {
    const limit = successorState == mdp.startState ? 1 : 0;
    constraints['maxSuccessorState' + successorState] = {'max': limit};
    constraints['minSuccessorState' + successorState] = {'min': limit};
  }

  for (const state of mdp.states) {
    for (const action of mdp.actions) {
      constraints['minState' + state + action] = {'min': 0};
    }
  }

  return constraints;
}

function getVariables(mdp) {
  const variables = {};

  for (const state of mdp.states) {
    for (const action of mdp.actions) {
      variables['state' + state + action] = {'value': mdp.rewardFunction(state, action)};

      for (const successorState of mdp.states) {
        let value = successorState == mdp.startState ? -1 : 1;

        if (state == successorState) {
          value *= mdp.discountFactor * (mdp.transitionFunction(state, action, successorState) - 1);
        } else {
          value *= mdp.discountFactor * mdp.transitionFunction(state, action, successorState);
        }

        variables['state' + state + action]['maxSuccessorState' + successorState] = value;
        variables['state' + state + action]['minSuccessorState' + successorState] = value;
      }

      for (const newState of mdp.states) {
        for (const newAction of mdp.actions) {
          variables['state' + state + action]['minState' + newState + newAction] = state == newState && action == newAction ? 1 : 0;
        }
      }
    }
  }

  return variables;
}

function getProgram(mdp) {
  return {
    'optimize': 'value',
    'opType': 'max',
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
