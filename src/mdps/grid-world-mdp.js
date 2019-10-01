'use strict';

const ACTION_MAP = {
  'STAY': {
    'movement': [0, 0],
    'slipDirections': [],
    'isAtBoundary': (row, column, grid) => false,
    'isValidMove': (row, successorRow, column, successorColumn) => row == successorRow && column == successorColumn
  },
  'NORTH': {
    'movement': [-1, 0],
    'slipDirections': ['EAST', 'WEST'],
    'isAtBoundary': (row, column, grid) => row == 0 || grid.grid[row - 1][column] == 'W',
    'isValidMove': (row, successorRow, column, successorColumn) => row == successorRow + 1 && column == successorColumn
  },
  'EAST': {
    'movement': [0, 1],
    'slipDirections': ['NORTH', 'SOUTH'],
    'isAtBoundary': (row, column, grid) => column == grid.width - 1 || grid.grid[row][column + 1] == 'W',
    'isValidMove': (row, successorRow, column, successorColumn) => row == successorRow && column == successorColumn - 1
  },
  'SOUTH': {
    'movement': [1, 0],
    'slipDirections': ['EAST', 'WEST'],
    'isAtBoundary': (row, column, grid) => row == grid.height - 1 || grid.grid[row + 1][column] == 'W',
    'isValidMove': (row, successorRow, column, successorColumn) => row == successorRow - 1 && column == successorColumn
  },
  'WEST': {
    'movement': [0, -1],
    'slipDirections': ['NORTH', 'SOUTH'],
    'isAtBoundary': (row, column, grid) => column == 0 || grid.grid[row][column - 1] == 'W',
    'isValidMove': (row, successorRow, column, successorColumn) => row == successorRow && column == successorColumn + 1
  }
};

function getAdjacentCells(grid, row, column, action) {
  const adjacentCells = [];

  for (const slipDirection of ACTION_MAP[action].slipDirections) {
    const [rowOffset, columnOffset] = ACTION_MAP[slipDirection].movement;
    const adjacentRow = row + rowOffset;
    const adjacentColumn = column + columnOffset;

    if (adjacentRow in grid && adjacentColumn in grid[adjacentRow]) {
      const adjacentCell = grid[adjacentRow][adjacentColumn];
      if (adjacentCell != 'W') {
        adjacentCells.push([adjacentRow, adjacentColumn]);
      }
    }
  }

  return adjacentCells;
}

class GridWorldMdp {
  constructor(gridWorld) {
    this._gridWorld = gridWorld;
  }

  states() {
    const size = this._gridWorld.width * this._gridWorld.height;
    return Array(size).keys();
  }

  actions() {
    return Object.keys(ACTION_MAP);
  }

  transitionFunction(state, action, successorState) {
    const row = Math.floor(state / this._gridWorld.width);
    const column = state - row * this._gridWorld.width;

    const successorRow = Math.floor(successorState / this._gridWorld.width);
    const successorColumn = successorState - successorRow * this._gridWorld.width;

    if (this._gridWorld.grid[row][column] == 'W') {
      if (row == successorRow && column == successorColumn) {
        return 1;
      }
      return 0;
    }

    const adjacentCells = getAdjacentCells(this._gridWorld.grid, row, column, action);
    for (const adjacentCell of adjacentCells) {
      const [adjacentRow, adjacentColumn] = adjacentCell;
      if (adjacentRow == successorRow && adjacentColumn == successorColumn) {
        return this._gridWorld.slipProbability / adjacentCells.length;
      }
    }

    const adjustment = adjacentCells.length > 0 ? this._gridWorld.slipProbability : 0;

    const isAtBoundary = ACTION_MAP[action].isAtBoundary(row, column, this._gridWorld);
    if (row == successorRow && column == successorColumn && isAtBoundary) {
      return 1 - adjustment;
    }

    if (this._gridWorld.grid[successorRow][successorColumn] == 'W') {
      return 0;
    }

    const isValidMove = ACTION_MAP[action].isValidMove(row, successorRow, column, successorColumn);
    if (isValidMove) {
      return 1 - adjustment;
    }

    return 0;
  }

  rewardFunction(state, action) {
    const row = Math.floor(state / this._gridWorld.width);
    const column = state - row * this._gridWorld.width;

    const cell = this._gridWorld.grid[row][column];

    return cell == 'G' && action == 'STAY' ? 1 : -1;
  }

  startState() {
    return this._gridWorld.width * this._gridWorld.position.row + this._gridWorld.position.column;
  }
}

module.exports = GridWorldMdp;
