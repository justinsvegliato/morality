'use strict';

const SPEEDS = {
  'NONE': null,
  'LOW': -10,
  'NORMAL': 0,
  'HIGH': 10
};
const SPEED_LIMITS = {
  'CITY': 25,
  'COUNTY': 45,
  'FREEWAY': 65
};
const GOAL_REWARD = 1000;
const DRIVER_ERROR_PENALTY = 3600;
const MANEUVER_TIME = 5;
const ACCELERATION_RATE = 2;

class SelfDrivingCarAgent {
  constructor(map) {
    this._map = map;

    this._stateRegistry = {};
    this._locationStates = [];
    this._roadStates = [];

    for (const name of map.locations) {
      this._stateRegistry[name] = {name: name};
      this._locationStates.push(name);
    }

    for (const name in map.roads) {
      for (const speed in SPEEDS) {
        const key = `${name}_${map.roads[name].type}_${speed}`;
        const record = Object.assign({}, map.roads[name], {name: name, speed: speed});
        this._stateRegistry[key] = record;
        this._roadStates.push(key);
      }
    }

    this._locationActions = ['STAY', ...Object.keys(map.roads).map((name) => 'TURN_ONTO_' + name)];
    this._roadActions = ['CRUISE', 'ACCELERATE_TO_LOW_SPEED', 'ACCELERATE_TO_SPEED_LIMIT', 'ACCELERATE_TO_HIGH_SPEED'];
  }

  states() {
    return [...this._locationStates, ...this._roadStates];
  }

  actions() {
    return [...this._locationActions, ...this._roadActions];
  }

  transitionFunction(state, action, successorState) {
    const stateRecord = this._stateRegistry[state];
    const successorStateRecord = this._stateRegistry[successorState];

    if (this._locationStates.includes(state)) {
      if (this._roadActions.includes(action) || action == 'STAY') {
        if (state == successorState) {
          return 1;
        }
        return 0;
      }

      if (action == 'TURN_ONTO_' + successorStateRecord.name) {
        if (successorStateRecord.fromLocation == stateRecord.name && successorStateRecord.speed == 'NONE') {
          return 1;
        }
      }

      for (const name in this._map.roads) {
        if (action == 'TURN_ONTO_' + name && name != successorStateRecord.name) {
          if (state == successorState && this._map.roads[name].fromLocation != stateRecord.name) {
            return 1;
          }
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
        if (stateRecord.speed == 'NONE' && stateRecord.name == successorStateRecord.name && successorStateRecord.speed == 'LOW') {
          return 1;
        }
        if (stateRecord.speed != 'NONE' && state == successorState) {
          return 1;
        }
      }

      if (action == 'ACCELERATE_TO_SPEED_LIMIT') {
        if (stateRecord.speed == 'NONE' && stateRecord.name == successorStateRecord.name && successorStateRecord.speed == 'NORMAL') {
          return 1;
        }
        if (stateRecord.speed != 'NONE' && state == successorState) {
          return 1;
        }
      }

      if (action == 'ACCELERATE_TO_HIGH_SPEED') {
        if (stateRecord.speed == 'NONE' && stateRecord.name == successorStateRecord.name && successorStateRecord.speed == 'HIGH') {
          return 1;
        }
        if (stateRecord.speed != 'NONE' && state == successorState) {
          return 1;
        }
      }

      if (action == 'CRUISE') {
        if (stateRecord.speed == 'NONE' && state == successorState) {
          return 1;
        }
        if (stateRecord.speed != 'NONE' && successorState == stateRecord.toLocation) {
          return 1;
        }
      }
    }

    return 0;
  }

  rewardFunction(state, action) {
    const stateRecord = this._stateRegistry[state];

    if (stateRecord.name == this._map.goalLocation && action == 'STAY') {
      return GOAL_REWARD;
    }

    if (this._locationStates.includes(state) && this._locationActions.includes(action)) {
      if (action == 'STAY') {
        return -MANEUVER_TIME;
      }
      for (const name in this._map.roads) {
        if (action == 'TURN_ONTO_' + name && this._map.roads[name].fromLocation == stateRecord.name) {
          return -MANEUVER_TIME;
        }
      }
    }

    if (this._roadStates.includes(state) && action == 'CRUISE' && stateRecord.speed != 'NONE') {
      const speed = SPEED_LIMITS[stateRecord.type] + SPEEDS[stateRecord.speed];
      const distance = stateRecord.length;
      return -360 * distance / speed;
    }

    if (this._roadStates.includes(state) && action == 'ACCELERATE_TO_LOW_SPEED' && stateRecord.speed == 'NONE') {
      const speed = SPEED_LIMITS[stateRecord.type] + SPEEDS['LOW'];
      return -ACCELERATION_RATE * speed / 10;
    }

    if (this._roadStates.includes(state) && action == 'ACCELERATE_TO_SPEED_LIMIT' && stateRecord.speed == 'NONE') {
      const speed = SPEED_LIMITS[stateRecord.type] + SPEEDS['NORMAL'];
      return -ACCELERATION_RATE * speed / 10;
    }

    if (this._roadStates.includes(state) && action == 'ACCELERATE_TO_HIGH_SPEED' && stateRecord.speed == 'NONE') {
      const speed = SPEED_LIMITS[stateRecord.type] + SPEEDS['HIGH'];
      return -ACCELERATION_RATE * speed / 10;
    }

    return -DRIVER_ERROR_PENALTY;
  }

  startStates() {
    return this._map.startLocations;
  }
}

module.exports = SelfDrivingCarAgent;
