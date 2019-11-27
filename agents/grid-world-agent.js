'use strict';

const SLIP_PROBABILITY = 0.1;

const ACTION_DETAILS = {
  'STAY': {
    'movement': [0, 0],
    'slipDirections': [],
    'isAtBoundary': (row, column, gridWorld) => false,
    'isValidMove': (row, successorRow, column, successorColumn) => row == successorRow && column == successorColumn
  },
  'NORTH': {
    'movement': [-1, 0],
    'slipDirections': ['EAST', 'WEST'],
    'isAtBoundary': (row, column, gridWorld) => row == 0 || gridWorld[row - 1][column] == 'W',
    'isValidMove': (row, successorRow, column, successorColumn) => row == successorRow + 1 && column == successorColumn
  },
  'EAST': {
    'movement': [0, 1],
    'slipDirections': ['NORTH', 'SOUTH'],
    'isAtBoundary': (row, column, gridWorld) => column == gridWorld[row].length - 1 || gridWorld[row][column + 1] == 'W',
    'isValidMove': (row, successorRow, column, successorColumn) => row == successorRow && column == successorColumn - 1
  },
  'SOUTH': {
    'movement': [1, 0],
    'slipDirections': ['EAST', 'WEST'],
    'isAtBoundary': (row, column, gridWorld) => row == gridWorld.length - 1 || gridWorld[row + 1][column] == 'W',
    'isValidMove': (row, successorRow, column, successorColumn) => row == successorRow - 1 && column == successorColumn
  },
  'WEST': {
    'movement': [0, -1],
    'slipDirections': ['NORTH', 'SOUTH'],
    'isAtBoundary': (row, column, gridWorld) => column == 0 || gridWorld[row][column - 1] == 'W',
    'isValidMove': (row, successorRow, column, successorColumn) => row == successorRow && column == successorColumn + 1
  }
};

function getAdjacentCells(gridWorld, row, column, action) {
  const adjacentCells = [];

  for (const slipDirection of ACTION_DETAILS[action].slipDirections) {
    const [rowOffset, columnOffset] = ACTION_DETAILS[slipDirection].movement;

    const adjacentRow = row + rowOffset;
    const adjacentColumn = column + columnOffset;

    if (adjacentRow in gridWorld && adjacentColumn in gridWorld[adjacentRow]) {
      const adjacentCell = gridWorld[adjacentRow][adjacentColumn];
      if (adjacentCell != 'W') {
        adjacentCells.push([adjacentRow, adjacentColumn]);
      }
    }
  }

  return adjacentCells;
}

class GridWorldAgent {
  constructor(gridWorld) {
    this._gridWorld = gridWorld;
    this._width = gridWorld[0].length;
    this._height = gridWorld.length;
  }

  states() {
    const size = this._width * this._height;
    return Array(size).keys();
  }

  actions() {
    return Object.keys(ACTION_DETAILS);
  }

  transitionFunction(state, action, successorState) {
    const row = Math.floor(state / this._width);
    const column = state - row * this._width;

    const successorRow = Math.floor(successorState / this._width);
    const successorColumn = successorState - successorRow * this._width;

    if (this._gridWorld[row][column] == 'W') {
      if (row == successorRow && column == successorColumn) {
        return 1;
      }
      return 0;
    }

    const adjacentCells = getAdjacentCells(this._gridWorld, row, column, action);
    for (const adjacentCell of adjacentCells) {
      const [adjacentRow, adjacentColumn] = adjacentCell;
      if (adjacentRow == successorRow && adjacentColumn == successorColumn) {
        return SLIP_PROBABILITY / adjacentCells.length;
      }
    }

    const adjustment = adjacentCells.length > 0 ? SLIP_PROBABILITY : 0;

    const isAtBoundary = ACTION_DETAILS[action].isAtBoundary(row, column, this._gridWorld);
    if (row == successorRow && column == successorColumn && isAtBoundary) {
      return 1 - adjustment;
    }

    if (this._gridWorld[successorRow][successorColumn] == 'W') {
      return 0;
    }

    const isValidMove = ACTION_DETAILS[action].isValidMove(row, successorRow, column, successorColumn);
    if (isValidMove) {
      return 1 - adjustment;
    }

    return 0;
  }

  rewardFunction(state, action) {
    const row = Math.floor(state / this._width);
    const column = state - row * this._width;
    const cell = this._gridWorld[row][column];

    if (cell == 'G' && action == 'STAY') {
      return 1;
    }

    return 0;
  }

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
