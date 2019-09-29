'use strict';

class ForbiddenStateEthicalContext {
  constructor(forbiddenStates, toleranceFunction) {
    this._forbiddenStates = forbiddenStates;
  }

  get forbiddenStates() {
    return this._forbiddenStates;
  }
}

module.exports = ForbiddenStateEthicalContext;

