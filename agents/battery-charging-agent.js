'use strict';

const ACTION_DETAILS = {
  'DO MISSION': {
    'movement': [0, 0],
    'slipDirections': [],
    'isAtBoundary': (row, column, gridWorld) => false,
    'isValidMove': (row, successorRow, column, successorColumn) => row == successorRow && column == successorColumn
  },
  'IDLE': {
    'movement': [-1, 0],
    'slipDirections': ['EAST', 'WEST'],
    'isAtBoundary': (row, column, gridWorld) => row == 0 || gridWorld[row - 1][column] == 'W',
    'isValidMove': (row, successorRow, column, successorColumn) => row == successorRow + 1 && column == successorColumn
  },
  'REQUEST CHARGE': {
    'movement': [0, 1],
    'slipDirections': ['NORTH', 'SOUTH'],
    'isAtBoundary': (row, column, gridWorld) => column == gridWorld[row].length - 1 || gridWorld[row][column + 1] == 'W',
    'isValidMove': (row, successorRow, column, successorColumn) => row == successorRow && column == successorColumn - 1
  },
  'CHARGE': {
    'movement': [1, 0],
    'slipDirections': ['EAST', 'WEST'],
    'isAtBoundary': (row, column, gridWorld) => row == gridWorld.length - 1 || gridWorld[row + 1][column] == 'W',
    'isValidMove': (row, successorRow, column, successorColumn) => row == successorRow - 1 && column == successorColumn
  }
};

// NOTE: I am trying to make 3 different "types" of agents that 
//       all have slightly different battery dynamics in one file... 
//       we don't need to do it this way, but for now it's easier... i think
class BatteryChargingAgent {
  constructor(battery_charging_world) {
    this._battery_charging_world = battery_charging_world;
    this._type = type;
    this._battery_levels = battery_levels;
    //TODO: need state factor to represent "place in line"
    this._xxx = xxx;
    this._states_per_type = this._xxx * this._battery_levels * 2 + 1
  }

  // TODO: convert to battery charging world
  states() {
    // +1 for charging state, +1 or +0 for doing mission?
    const size = this._battery_levels * this._xxx * + 1;
    return [...Array(size).keys()];
  }

  // TODO: convert to battery charging wolrd
  actions() {
    return Object.keys(ACTION_DETAILS);
  }

  // TODO: convert to battery charging wolrd
  transitionFunction(state, action, successorState) {
    curr_type = Math.floor(state / this._states_per_type);
    state = state % this._states_per_type
    successor_type = Math.floor(successorState / this._states_per_type);
    successorState = successorState % this._states_per_type

    if (curr_type != successor_type) {
      return 0.0;
    }

    //TODO: calc battery level
    //TODO: calc place in line
    //TODO: if at charging station

    if () {

    }

  }

  // TODO: convert to battery charging wolrd
  rewardFunction(state, action) {
    battery_level = f(state)
    if (battery_level > 0 && action == 'DO MISSION') {
      return 0.0;
    }
    if () {
      return -2.0;
    }

    return -1.0;
  }

  // TODO: convert to battery charging wolrd
  startStates() {
    const startStates = [];

    for (let row = 0; row < this._height; row++) {
      for (let column = 0; column < this._width; column++) {
        if (this._gridWorld[row][column] != 'W') {
          startStates.push(this._width * row + column);
        }
      }
    }

    return startStates;
  }
}

module.exports = GridWorldAgent;
