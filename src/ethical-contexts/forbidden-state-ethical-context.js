'use strict';

class ForbiddenStateEthicalContext {
  constructor(forbiddenStates, toleranceFunction) {
    this._forbiddenStates = forbiddenStates;
    this._toleranceFunction = toleranceFunction;
  }

  get forbiddenStates() {
    return this._forbiddenStates;
  }

  get toleranceFunction() {
    return this._toleranceFunction;
  }
}

module.exports = ForbiddenStateEthicalContext;

