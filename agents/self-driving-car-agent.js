'use strict';

const ACCELERATE_ACTIONS = {
  'ACCELERATE_TO_LOW_SPEED': 'LOW',
  'ACCELERATE_TO_NORMAL_SPEED': 'NORMAL',
  'ACCELERATE_TO_HIGH_SPEED': 'HIGH'
};

const SPEED_ADJUSTMENTS = {
  'NONE': null,
  'LOW': -10,
  'NORMAL': 0,
  'HIGH': 10,
};

const SPEED_LIMITS = {
  'CITY': 25,
  'COUNTY': 45,
  'FREEWAY': 65
};

const CONDITIONS = {
  'EMPTY': 0.8,
  'BUSY': 0.2
};

const MANEUVER_TIME = 5;
const ACCELERATION_RATE = 2;
const DRIVER_ERROR_PENALTY = 3600;

class SelfDrivingCarAgent {
  constructor(world) {
    this._world = world;

    this._stateRegistry = {};
    this._locationStates = [];
    this._roadStates = [];

    for (const name of world.locations) {
      this._stateRegistry[name] = {name: name};
      this._locationStates.push(name);
    }

    for (const name in world.roads) {
      for (const speed in SPEED_ADJUSTMENTS) {
        for (const condition in CONDITIONS) {
          const key = `${name}_${world.roads[name].type}_${speed}_${condition}`;
          const record = Object.assign({}, world.roads[name], {name: name, speed: speed, condition: condition});
          this._stateRegistry[key] = record;
          this._roadStates.push(key);
        }
      }
    }

    this._turnActions = Object.keys(world.roads).map((name) => `TURN_ONTO_${name}`);
    this._locationActions = ['STAY', ...this._turnActions];

    this._accelerateActions = Object.keys(ACCELERATE_ACTIONS);
    this._roadActions = ['CRUISE', ...this._accelerateActions];
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
        if (stateRecord.name == successorStateRecord.fromLocation && successorStateRecord.speed == 'NONE') {
          return CONDITIONS[successorStateRecord.condition];
        }
      }

      for (const name in this._world.roads) {
        if (action == 'TURN_ONTO_' + name && name != successorStateRecord.name) {
          if (state == successorState && stateRecord.name != this._world.roads[name].fromLocation) {
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

      if (this._accelerateActions.includes(action)) {
        if (stateRecord.speed == 'NONE' && stateRecord.name == successorStateRecord.name && stateRecord.condition == successorStateRecord.condition && successorStateRecord.speed == ACCELERATE_ACTIONS[action]) {
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

    if (this._world.goalLocation == stateRecord.name && action == 'STAY') {
      return 0;
    }

    if (this._locationStates.includes(state) && action == 'STAY') {
      return -MANEUVER_TIME;
    }

    if (this._locationStates.includes(state) && this._turnActions.includes(action)) {
      for (const name in this._world.roads) {
        if (action == 'TURN_ONTO_' + name && stateRecord.name == this._world.roads[name].fromLocation) {
          return -MANEUVER_TIME;
        }
      }
    }

    if (this._roadStates.includes(state) && action == 'CRUISE' && stateRecord.speed != 'NONE') {
      const speed = SPEED_LIMITS[stateRecord.type] + SPEED_ADJUSTMENTS[stateRecord.speed];
      const distance = stateRecord.length;
      return -360 * distance / speed;
    }

    if (this._roadStates.includes(state) && this._accelerateActions.includes(action) && stateRecord.speed == 'NONE') {
      const speed = SPEED_LIMITS[stateRecord.type] + SPEED_ADJUSTMENTS[ACCELERATE_ACTIONS[action]];
      return -ACCELERATION_RATE * speed / 10;
    }

    return -DRIVER_ERROR_PENALTY;
  }

  startStates() {
    return this._world.startLocations;
  }

  interpret(state) {
    return this._stateRegistry[state];
  }
}

module.exports = SelfDrivingCarAgent;
