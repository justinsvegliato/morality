'use strict';

class ForbiddenStateEthics {
  constructor(forbiddenStates) {
    this._forbiddenStates = forbiddenStates;
  }

  get forbiddenStates() {
    return this._forbiddenStates;
  }

  transform(agent, program) {
    for (const state of this._forbiddenStates) {
      for (const action of agent.actions()) {
        program.constraints['forbiddenStateEthics-' + state + action] = {'max': 0};
      }
    }

    for (const state of agent.states()) {
      for (const action of agent.actions()) {
        for (const forbiddenStates of this._forbiddenStates) {
          for (const newAction of agent.actions()) {
            const isActive = state == forbiddenStates && action == newAction ? 1 : 0;
            program.variables['state' + state + action]['forbiddenStateEthics-' + forbiddenStates + newAction] = isActive;
          }
        }
      }
    }
  }
}

module.exports = ForbiddenStateEthics;
