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

function getValues(mdp, result) {
  const values = {};

  for (const variableState of mdp.states()) {
    values[variableState] = isNaN(result[`state${variableState}`]) ? 0 : result[`state${variableState}`];
  }

  return values;
}

function getDeterministicPolicy(mdp, values) {
  const policy = {};

  for (const state of mdp.states()) {
    let optimalActionValue = Number.NEGATIVE_INFINITY;
    let optimalAction = null;

    for (const action of mdp.actions()) {
      const immediateReward = mdp.rewardFunction(state, action);

      let expectedFutureReward = 0;
      for (const successorState of mdp.states()) {
        const transitionProbability = mdp.transitionFunction(state, action, successorState);
        expectedFutureReward += transitionProbability * values[successorState];
      }

      const actionValue = immediateReward + DISCOUNT_FACTOR * expectedFutureReward;

      if (actionValue > optimalActionValue) {
        optimalActionValue = actionValue;
        optimalAction = action;
      }
    }

    policy[state] = optimalAction;
  }

  return policy;
}

function getStochasticPolicy(mdp, values) {
  const policy = {};

  for (const state of mdp.states()) {
    let normalizer = 0;

    policy[state] = {};

    for (const action of mdp.actions()) {
      const immediateReward = mdp.rewardFunction(state, action);

      let expectedFutureReward = 0;
      for (const successorState of mdp.states()) {
        const transitionProbability = mdp.transitionFunction(state, action, successorState);
        expectedFutureReward += transitionProbability * values[successorState];
      }

      const actionValue = immediateReward + DISCOUNT_FACTOR * expectedFutureReward;
      policy[state][action] = actionValue;

      normalizer += actionValue;
    }

    for (const action of mdp.actions()) {
      policy[state][action] /= normalizer;
    }
  }

  return policy;
}

function solve(mdp, transformer, isStochastic = false) {
  const program = getProgram(mdp, transformer);
  const result = solver.Solve(program);

  if (!result.feasible) {
    return false;
  }

  const objective = result.result;
  const values = getValues(mdp, result);

  if (isStochastic) {
    const policy = getStochasticPolicy(mdp, values);

    return {
      objective,
      policy
    };
  }

  const policy = getDeterministicPolicy(mdp, values);

  return {
    objective,
    policy,
    values
  };
}

module.exports = {
  solve
};
