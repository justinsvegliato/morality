'use strict';

class EthicalContext {
  constructor(norms, penaltyFunction, toleranceFunction) {
    this._norms = norms;
    this._penaltyFunction = penaltyFunction;
    this._toleranceFunction = toleranceFunction;
  }

  get norms() {
    return this._norms;
  }

  get penaltyFunction() {
    return this._penaltyFunction;
  }

  get toleranceFunction() {
    return this._toleranceFunction;
  }
}

module.exports = {
  EthicalContext,
};

