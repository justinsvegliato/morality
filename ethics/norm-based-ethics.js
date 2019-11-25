'use strict';

class NormBasedEthics {
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
    program.constraints['normBasedEthics'] = {'max': this._tolerance};

    for (const state of agent.states()) {
      for (const action of agent.actions()) {
        let coefficient = 0;
        for (const successorState of agent.states()) {
          for (const norm of this._violationFunction(successorState)) {
            coefficient += agent.transitionFunction(state, action, successorState) * this._penaltyFunction(norm, state, action);
          }
        }

        program.variables[`state${state}${action}`]['normBasedEthics'] = coefficient;
      }
    }
  }
}

module.exports = NormBasedEthics;
