'use strict';

class ForbiddenStateEthicalContext {
  constructor(forbiddenStates) {
    this._forbiddenStates = forbiddenStates;
  }

  get forbiddenStates() {
    return this._forbiddenStates;
  }
}

module.exports = ForbiddenStateEthicalContext;

