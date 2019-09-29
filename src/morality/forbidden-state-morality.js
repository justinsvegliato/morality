'use strict';

class ForbiddenStateMorality {
  constructor(forbiddenStates) {
    this._forbiddenStates = forbiddenStates;
  }

  get forbiddenStates() {
    return this._forbiddenStates;
  }

  transform(mdp, program) {
    for (const state of this._forbiddenStates) {
      for (const action of mdp.actions()) {
        program.constraints['forbiddenStateEthics-' + state + action] = {'max': 0};
      }
    }

    for (const state of mdp.states()) {
      for (const action of mdp.actions()) {
        for (const forbiddenStates of this._forbiddenStates) {
          for (const newAction of mdp.actions()) {
            const isActive = state == forbiddenStates && action == newAction ? 1 : 0;
            program.variables['state' + state + action]['forbiddenStateEthics-' + forbiddenStates + newAction] = isActive;
          }
        }
      }
    }
  }
}

module.exports = ForbiddenStateMorality;

