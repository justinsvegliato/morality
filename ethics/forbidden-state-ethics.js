'use strict';

class ForbiddenStateEthics {
  constructor(forbiddenStates) {
    this._forbiddenStates = forbiddenStates;
  }

  get forbiddenStates() {
    return this._forbiddenStates;
  }

  transform(agent, program) {
    for (const state of agent.states()) {
      for (const action of agent.actions()) {
        program.constraints[`forbiddenStateEthics${state}${action}`] = {'max': 0};

        let coefficient = 0;
        for (const forbiddenSuccessorState of this._forbiddenStates) {
          coefficient += agent.transitionFunction(state, action, forbiddenSuccessorState);
        }

        program.variables[`state${state}${action}`][`forbiddenStateEthics${state}${action}`] = coefficient;
      }
    }
  }
}

module.exports = ForbiddenStateEthics;

