'use strict';

const solver = require('javascript-lp-solver');

const DISCOUNT_FACTOR = 0.99;
const EPSILON = 0.001;

function getConstraints(mdp) {
  const constraints = {};

  for (const constraintSuccessorState of mdp.states()) {
    const limit = mdp.startStates().includes(constraintSuccessorState) ? 1 / mdp.startStates().length : 0;
    constraints[`successorState${constraintSuccessorState}`] = {'max': limit};
  }

  return constraints;
}

function getVariables(mdp) {
  const variables = {};

  for (const variableState of mdp.states()) {
    for (const variableAction of mdp.actions()) {
      variables[`state${variableState}${variableAction}`] = {'value': mdp.rewardFunction(variableState, variableAction)};

      for (const constraintSuccessorState of mdp.states()) {
        let coefficient = -1;

        if (variableState == constraintSuccessorState) {
          coefficient *= DISCOUNT_FACTOR * mdp.transitionFunction(variableState, variableAction, constraintSuccessorState) - 1;
        } else {
          coefficient *= DISCOUNT_FACTOR * mdp.transitionFunction(variableState, variableAction, constraintSuccessorState);
        }

        variables[`state${variableState}${variableAction}`][`successorState${constraintSuccessorState}`] = coefficient;
      }
    }
  }

  return variables;
}

function getProgram(mdp, transformer) {
  const program = {
    'optimize': 'value',
    'opType': 'max',
    'constraints': getConstraints(mdp),
    'variables': getVariables(mdp)
  };

  if (transformer) {
    transformer.transform(mdp, program);
  }

  return program;
}

function getOccupancyMeasures(mdp, result) {
  const occupancyMeasures = {};

  for (const variableState of mdp.states()) {
    occupancyMeasures[variableState] = {};
    for (const variableAction of mdp.actions()) {
      occupancyMeasures[variableState][variableAction] = isNaN(result[`state${variableState}${variableAction}`]) ? 0 : result[`state${variableState}${variableAction}`];
    }
  }

  return occupancyMeasures;
}

function getPolicy(mdp, occupancyMeasures) {
  const policy = {};

  for (const variableState of mdp.states()) {
    let optimalOccupancyMeasure = Number.NEGATIVE_INFINITY;
    let optimalAction = null;

    for (const variableAction of mdp.actions()) {
      const occupancyMeasure = occupancyMeasures[variableState][variableAction];
      if (occupancyMeasure > optimalOccupancyMeasure) {
        optimalOccupancyMeasure = occupancyMeasure;
        optimalAction = variableAction;
      }
    }

    policy[variableState] = optimalAction;
  }

  return policy;
}

function getValues(mdp, policy) {
  const memoizedTransitionFunction = {};
  const memoizedRewardFunction = {};

  for (const state of mdp.states()) {
    memoizedTransitionFunction[state] = {};
    for (const successorState of mdp.states()) {
      memoizedTransitionFunction[state][successorState] = mdp.transitionFunction(state, policy[state], successorState);
    }

    memoizedRewardFunction[state] = mdp.rewardFunction(state, policy[state]);
  }

  const values = {};
  for (const state of mdp.states()) {
    values[state] = 0;
  }

  while (true) {
    let delta = 0;

    for (const state of mdp.states()) {
      const immediateReward = memoizedRewardFunction[state];

      let expectedFutureReward = 0;
      for (const successorState of mdp.states()) {
        const transitionProbability = memoizedTransitionFunction[state][successorState];
        expectedFutureReward += transitionProbability * values[successorState];
      }

      const newValue = immediateReward + DISCOUNT_FACTOR * expectedFutureReward;

      delta = Math.max(delta, Math.abs(newValue - values[state]));

      values[state] = newValue;
    }

    if (delta <= EPSILON) {
      return values;
    }
  }
}

function solve(mdp, transformer) {
  const program = getProgram(mdp, transformer);
  const result = solver.Solve(program);

  if (!result.feasible) {
    return false;
  }

  const objective = result.result;
  const occupancyMeasures = getOccupancyMeasures(mdp, result);
  const policy = getPolicy(mdp, occupancyMeasures);
  const values = getValues(mdp, policy);

  return {
    objective,
    policy,
    values
  };
}

module.exports = {
  solve: solve
};
