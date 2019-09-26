'use strict';

class Mdp {
  constructor(states, actions, transitionFunction, rewardFunction, startState, discountFactor) {
    this._states = states;
    this._actions = actions;
    this._transitionFunction = transitionFunction;
    this._rewardFunction = rewardFunction;
    this._startState = startState;
    this._discountFactor = discountFactor;
  }

  get states() {
    return this._states;
  }

  get actions() {
    return this._actions;
  }

  get transitionFunction() {
    return this._transitionFunction;
  }

  get rewardFunction() {
    return this._rewardFunction;
  }

  get startState() {
    return this._startState;
  }

  get discountFactor() {
    return this._discountFactor;
  }
}

module.exports = Mdp;
