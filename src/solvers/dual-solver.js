'use strict';

const solver = require('javascript-lp-solver');

const DISCOUNT_FACTOR = 0.99;

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

function getSolution(mdp, result) {
  const policy = {};
  const values = {};

  const occupancyMeasures = normalize(mdp, result);

  for (const variableState of mdp.states()) {
    let optimalOccupancyMeasure = Number.NEGATIVE_INFINITY;
    let optimalAction = null;

    let optimalValue = 0;

    for (const variableAction of mdp.actions()) {
      const occupancyMeasure = occupancyMeasures[`state${variableState}${variableAction}`];
      if (occupancyMeasure > optimalOccupancyMeasure) {
        optimalOccupancyMeasure = occupancyMeasure;
        optimalAction = variableAction;
      }

      optimalValue += mdp.rewardFunction(variableState, variableAction) * occupancyMeasures[`state${variableState}${variableAction}`];
    }

    policy[variableState] = optimalAction;
    values[variableState] = optimalValue;
  }

  return {
    policy,
    values
  };
}

function normalize(mdp, result) {
  for (const variableState of mdp.states()) {
    for (const variableAction of mdp.actions()) {
      if (isNaN(result[`state${variableState}${variableAction}`])) {
        result[`state${variableState}${variableAction}`] = 0;
      }
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

  return getSolution(mdp, result);
}

module.exports = {
  solve
};
