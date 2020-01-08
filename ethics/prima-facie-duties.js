'use strict';

class PrimaFacieDuties {
  constructor(duties, violationFunction, penaltyFunction, tolerance) {
    this._duties = duties;
    this._violationFunction = violationFunction;
    this._penaltyFunction = penaltyFunction;
    this._tolerance = tolerance;
  }

  get duties() {
    return this._duties;
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
    program.constraints['primaFacieDuties'] = {'max': this._tolerance};

    for (const state of agent.states()) {
      for (const action of agent.actions()) {
        let coefficient = 0;
        for (const successorState of agent.states()) {
          for (const duty of this._violationFunction(successorState)) {
            coefficient += agent.transitionFunction(state, action, successorState) * this._penaltyFunction(duty, successorState);
          }
        }

        program.variables[`state${state}${action}`]['primaFacieDuties'] = coefficient;
      }
    }
  }
}

module.exports = PrimaFacieDuties;
