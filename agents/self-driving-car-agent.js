'use strict';

const SPEEDS = ['NONE', 'LOW', 'NORMAL', 'HIGH'];
const COSTS = {
  'NONE': Infinity,
  'LOW': 2,
  'NORMAL': 1,
  'HIGH': 0.5
};

class SelfDrivingCarAgent {
  constructor(map) {
    this._map = map;

    this._stateRegistry = {};
    this._locationStates = [];
    this._roadStates = [];

    for (const location of map.locations) {
      this._stateRegistry[location] = location;
      this._locationStates.push(location);
    }

    for (const name in map.roads) {
      for (const speed of SPEEDS) {
        const key = `${name}_${map.roads[name].type}_${speed}`;
        const record = Object.assign({}, map.roads[name], {name: name, speed: speed});
        this._stateRegistry[key] = record;
        this._roadStates.push(key);
      }
    }

    this._locationActions = ['STAY', ...Object.keys(map.roads).map((name) => 'TURN_ONTO_' + name)];
    this._roadActions = ['CRUISE', 'ACCELERATE_TO_LOW_SPEED', 'ACCELERATE_TO_SPEED_LIMIT', 'ACCELERATE_TO_HIGH_SPEED'];

    this._states = [...this._locationStates, ...this._roadStates];
    this._actions = [...this._locationActions, ...this._roadActions];
  }

  states() {
    return this._states;
  }

  actions() {
    return this._actions;
  }

  transitionFunction(state, action, successorState) {
    const stateRecord = this._stateRegistry[state];
    const successorStateRecord = this._stateRegistry[successorState];

    if (this._locationStates.includes(state)) {
      if (action == 'STAY' || this._roadActions.includes(action)) {
        if (state == successorState) {
          return 1;
        }
        return 0;
      }

      for (const name of Object.keys(this._map.roads)) {
        if (action == 'TURN_ONTO_' + name) {
          if (name == successorStateRecord.name && this._map.roads[name].fromLocation == state && successorStateRecord.speed == 'NONE') {
            return 1;
          }
          if (state == successorState && this._map.roads[name].fromLocation != state) {
            return 1;
          }
          return 0;
        }
      };
    }

    if (this._roadStates.includes(state)) {
      if (this._locationActions.includes(action)) {
        if (state == successorState) {
          return 1;
        }
        return 0;
      }

      if (action == 'ACCELERATE_TO_LOW_SPEED') {
        if (stateRecord.speed == 'NONE' && successorStateRecord.name == stateRecord.name && successorStateRecord.speed == 'LOW') {
          return 1;
        }
        // return 0;
      }
      if (action == 'ACCELERATE_TO_SPEED_LIMIT') {
        if (stateRecord.speed == 'NONE' && successorStateRecord.name == stateRecord.name && successorStateRecord.speed == 'NORMAL') {
          return 1;
        }
        // return 0;
      }
      if (action == 'ACCELERATE_TO_HIGH_SPEED') {
        if (stateRecord.speed == 'NONE' && successorStateRecord.name == stateRecord.name && successorStateRecord.speed == 'HIGH') {
          return 1;
        }
        // return 0;
      }
      if (action == 'CRUISE') {
        if (state == successorState) {
          return 1;
        }
      }

      if (action == 'CRUISE') {
        if (successorState == stateRecord.toLocation) {
          return 1;
        }
        return 0;
      }

      if (this._roadActions.includes(action)) {
        if (state == successorState) {
          return 1;
        }
      }
    }

    return 0;
  }

  rewardFunction(state, action) {
    const stateRecord = this._stateRegistry[state];

    if (state == this._map.goalLocation && action == 'STAY') {
      return 100;
    }

    if (this._roadStates.includes(state) && action == 'CRUISE') {
      return -COSTS[stateRecord.speed] * stateRecord.length;
    }

    return -1;
  }

  startStates() {
    return this._states;
  }
}

module.exports = SelfDrivingCarAgent;
