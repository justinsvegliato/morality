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

  states() {
    return this._states;
  }

  actions() {
    return this._actions;
  }

  transitionFunction(state, action, successorState) {
    return this._transitionFunction(state, action, successorState);
  }

  rewardFunction(state, action) {
    return this._rewardFunction(state, action);
  }

  startState() {
    return this._startState;
  }
}

module.exports = Mdp;
