'use strict';

const solver = require('javascript-lp-solver');

function getConstraints(mdp, ethicalContext) {
  const constraints = {};

  for (const successorState of mdp.states()) {
    const limit = successorState == mdp.startState() ? 1 : 0;
    constraints['maxSuccessorState' + successorState] = {'max': limit};
    constraints['minSuccessorState' + successorState] = {'min': limit};
  }

  // TODO Figure out how to improve this
  for (const state of ethicalContext.forbiddenStates) {
    for (const action of mdp.actions()) {
      constraints['forbidState' + state + action] = {'max': 0};
    }
  }

  return constraints;
}

function getVariables(mdp, ethicalContext, discountFactor) {
  const variables = {};

  for (const state of mdp.states()) {
    for (const action of mdp.actions()) {
      variables['state' + state + action] = {'value': mdp.rewardFunction(state, action)};

      for (const successorState of mdp.states()) {
        let value = successorState == mdp.startState() ? -1 : 1;

        if (state == successorState) {
          value *= discountFactor * mdp.transitionFunction(state, action, successorState) - 1;
        } else {
          value *= discountFactor * mdp.transitionFunction(state, action, successorState);
        }

        variables['state' + state + action]['maxSuccessorState' + successorState] = value;
        variables['state' + state + action]['minSuccessorState' + successorState] = value;
      }

      // TODO Figure out how to improve this
      for (const forbiddenStates of ethicalContext.forbiddenStates) {
        for (const newAction of mdp.actions()) {
          variables['state' + state + action]['forbidState' + forbiddenStates + newAction] = state == forbiddenStates && action == newAction ? 1 : 0;
        }
      }
    }
  }

  return variables;
}

function getProgram(mdp, ethicalContext, discountFactor) {
  return {
    'optimize': 'value',
    'opType': 'max',
    'constraints': getConstraints(mdp, ethicalContext),
    'variables': getVariables(mdp, ethicalContext, discountFactor)
  };
}

function getPolicy(mdp, result) {
  const policy = {};

  const occupancyMeasures = normalize(mdp, result);

  for (const state of mdp.states()) {
    let optimalOccupancyMeasure = Number.NEGATIVE_INFINITY;
    let optimalAction = null;

    for (const action of mdp.actions()) {
      const occupancyMeasure = occupancyMeasures['state' + state + action];

      if (occupancyMeasure > optimalOccupancyMeasure) {
        optimalOccupancyMeasure = occupancyMeasure;
        optimalAction = action;
      }
    }

    policy[state] = optimalAction;
  }

  return policy;
}

function normalize(mdp, result) {
  for (const state of mdp.states()) {
    for (const action of mdp.actions()) {
      if (isNaN(result['state' + state + action])) {
        result['state' + state + action] = 0;
      }
    }
  }
  return result;
}

function solve(mdp, ethicalContext, discountFactor) {
  const program = getProgram(mdp, ethicalContext, discountFactor);
  const result = solver.Solve(program);
  return getPolicy(mdp, result);
}

module.exports = {
  solve
};
