'use strict';

const solver = require('javascript-lp-solver');

const DISCOUNT_FACTOR = 0.99;

function getConstraints(mdp) {
  const constraints = {};

  for (const constraintState of mdp.states()) {
    for (const constraintAction of mdp.actions()) {
      constraints[`state${constraintState}${constraintAction}`] = {'min': mdp.rewardFunction(constraintState, constraintAction)};
    }
  }

  return constraints;
}

function getVariables(mdp) {
  const variables = {};

  for (const variableState of mdp.states()) {
    variables[`state${variableState}`] = {'value': 1};

    for (const constraintState of mdp.states()) {
      for (const constraintAction of mdp.actions()) {
        if (variableState == constraintState) {
          variables[`state${variableState}`][`state${constraintState}${constraintAction}`] = 1 - DISCOUNT_FACTOR * mdp.transitionFunction(constraintState, constraintAction, variableState);
        } else {
          variables[`state${variableState}`][`state${constraintState}${constraintAction}`] = DISCOUNT_FACTOR * -mdp.transitionFunction(constraintState, constraintAction, variableState);
        }
      }
    }
  }

  return variables;
}

function getProgram(mdp, transformer) {
  const program = {
    'optimize': 'value',
    'opType': 'min',
    'constraints': getConstraints(mdp),
    'variables': getVariables(mdp)
  };

  if (transformer) {
    transformer.transform(mdp, program);
  }

  return program;
}

function getPolicy(mdp, result) {
  const policy = {};

  const values = normalize(mdp, result);

  for (const state of mdp.states()) {
    let optimalActionValue = Number.NEGATIVE_INFINITY;
    let optimalAction = null;

    for (const action of mdp.actions()) {
      const immediateReward = mdp.rewardFunction(state, action);

      let expectedFutureReward = 0;
      for (const successorState of mdp.states()) {
        const transitionProbability = mdp.transitionFunction(state, action, successorState);
        const value = values[`state${successorState}`];
        expectedFutureReward += transitionProbability * value;
      }
      expectedFutureReward *= DISCOUNT_FACTOR;

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
  for (const variableState of mdp.states()) {
    if (isNaN(result[`state${variableState}`])) {
      result[`state${variableState}`] = 0;
    }
  }
  return result;
}

function solve(mdp, transformer) {
  const program = getProgram(mdp, transformer);
  const result = solver.Solve(program);

  if (!result.feasible) {
    return false;
  }

  return getPolicy(mdp, result);
}

module.exports = {
  solve
};
