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

  // TODO Figure out how to improve this
  // for (const state of ethicalContext.forbiddenStates) {
  //   for (const action of mdp.actions) {
  //     constraints['forbidState' + state + action] = {'max': 0};
  //   }
  // }

  return constraints;
}

function getVariables(mdp, ethicalContext) {
  const variables = {};

  for (const state of mdp.states) {
    for (const action of mdp.actions) {
      variables['state' + state + action] = {'value': mdp.rewardFunction(state, action)};

      for (const successorState of mdp.states) {
        let value = successorState == mdp.startState ? -1 : 1;

        if (state == successorState) {
          value *= mdp.discountFactor * mdp.transitionFunction(state, action, successorState) - 1;
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

      // TODO Figure out how to improve this
      // for (const forbiddenStates of ethicalContext.forbiddenStates) {
      //   for (const newAction of mdp.actions) {
      //     variables['state' + state + action]['forbidState' + forbiddenStates + newAction] = state == forbiddenStates && action == newAction ? 1 : 0;
      //   }
      // }
    }
  }

  return variables;
}

function getProgram(mdp, ethicalContext) {
  return {
    'optimize': 'value',
    'opType': 'max',
    'constraints': getConstraints(mdp, ethicalContext),
    'variables': getVariables(mdp, ethicalContext),
  };
}

function getPolicy(mdp, result) {
  const policy = {};

  for (const state of mdp.states) {
    let optimalOccupancyMeasure = Number.NEGATIVE_INFINITY;
    let optimalAction = null;

    for (const action of mdp.actions) {
      const occupancyMeasure = result['state' + state + action];

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
  for (const state of mdp.states) {
    for (const action of mdp.actions) {
      if (isNaN(result['state' + state + action])) {
        result['state' + state + action] = 0;
      }
    }
  }
  return result;
}

function solve(mdp, ethicalContext) {
  const program = getProgram(mdp, ethicalContext);
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
