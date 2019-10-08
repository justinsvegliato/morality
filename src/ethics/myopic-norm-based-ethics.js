'use strict';

class NormBasedEthics {
  constructor(norms, violationFunction, penaltyFunction, toleranceFunction) {
    this._norms = norms;
    this._violationFunction = violationFunction;
    this._penaltyFunction = penaltyFunction;
    this._toleranceFunction = toleranceFunction;
  }

  get norms() {
    return this._norms;
  }

  get violationFunction() {
    return this._violationFunction;
  }

  get penaltyFunction() {
    return this._penaltyFunction;
  }

  get toleranceFunction() {
    return this._toleranceFunction;
  }

  transform(agent, program) {
    for (const constraintState of agent.states()) {
      program.constraints['normBasedEthics' + constraintState] = {'max': this.toleranceFunction(constraintState)};
    }

    for (const variableState of agent.states()) {
      for (const variableAction of agent.actions()) {
        for (const constraintState of agent.states()) {
          if (variableState != constraintState) {
            program.variables['state' + variableState + variableAction]['normBasedEthics' + constraintState] = 0;
            continue;
          }

          let coefficient = 0;
          for (const successorState of agent.states()) {
            for (const norm of this._violationFunction(successorState)) {
              coefficient += agent.transitionFunction(variableState, variableAction, successorState) * this._penaltyFunction(norm, variableState, variableAction);
            }
          }
          program.variables['state' + variableState + variableAction]['normBasedEthics' + constraintState] = coefficient;
        }
      }
    }
  }
}

module.exports = NormBasedEthics;
