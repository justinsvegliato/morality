'use strict';

class NonmyopicNormBasedEthics {
  constructor(norms, violationFunction, penaltyFunction, tolerance) {
    this._norms = norms;
    this._violationFunction = violationFunction;
    this._penaltyFunction = penaltyFunction;
    this._tolerance = tolerance;
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

  get tolerance() {
    return this._tolerance;
  }

  transform(agent, program) {
    program.constraints['nonmyopicNormBasedEthics'] = {'max': this._tolerance};

    for (const variableState of agent.states()) {
      for (const variableAction of agent.actions()) {
        let coefficient = 0;
        for (const successorState of agent.states()) {
          for (const norm of this._violationFunction(successorState)) {
            coefficient += agent.transitionFunction(variableState, variableAction, successorState) * this._penaltyFunction(norm, variableState, variableAction);
          }
        }
        program.variables['state' + variableState + variableAction]['nonmyopicNormBasedEthics'] = coefficient;
      }
    }
  }
}

module.exports = NonmyopicNormBasedEthics;
