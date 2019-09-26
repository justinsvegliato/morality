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
          variables['state' + state]['state' + newState + action] = 1 - mdp.discountFactor * mdp.transitionFunction(newState, action, state);
        } else {
          variables['state' + state]['state' + newState + action] = mdp.discountFactor * -mdp.transitionFunction(newState, action, state);
        }
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

function getPolicy(mdp, result) {
  const policy = {};

  for (const state of mdp.states) {
    let optimalActionValue = Number.NEGATIVE_INFINITY;
    let optimalAction = null;

    for (const action of mdp.actions) {
      let expectedFutureReward = 0;
      for (const successorState of mdp.states) {
        const transitionProbability = mdp.transitionFunction(state, action, successorState);
        const value = result['state' + successorState];
        expectedFutureReward += transitionProbability * value;
      }
      expectedFutureReward *= mdp.discountFactor;

      const immediateReward = mdp.rewardFunction(state, action);
      const actionValue = immediateReward + expectedFutureReward;

      if (actionValue > optimalActionValue) {
        optimalActionValue = actionValue;
        optimalAction = action;
      }
    }

    policy[state] = optimalAction;
  }

  return policy;
}

function normalize(mdp, result) {
  for (const successorState of mdp.states) {
    if (isNaN(result['state' + successorState])) {
      result['state' + successorState] = 0;
    }
  }
  return result;
}

function solve(mdp) {
  const program = getProgram(mdp);
  const result = solver.Solve(program);
  const normalizedResult = normalize(mdp, result);
  return getPolicy(mdp, normalizedResult);
}

module.exports = {
  getConstraints,
  getVariables,
  getProgram,
  solve,
};
