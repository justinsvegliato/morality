'use strict';

const actionMap = {
  'STAY': {
    'movement': [0, 0],
    'slipDirections': [],
    'isAtBoundary': (row, column, grid) => false,
    'isValidMove': (row, successorRow, column, successorColumn) => row == successorRow && column == successorColumn
  },
  'NORTH': {
    'movement': [-1, 0],
    'slipDirections': ['EAST', 'WEST'],
    'isAtBoundary': (row, column, grid) => row == 0 || grid.map[row - 1][column] == 'W',
    'isValidMove': (row, successorRow, column, successorColumn) => row == successorRow + 1 && column == successorColumn
  },
  'EAST': {
    'movement': [0, 1],
    'slipDirections': ['NORTH', 'SOUTH'],
    'isAtBoundary': (row, column, grid) => column == grid.width - 1 || grid.map[row][column + 1] == 'W',
    'isValidMove': (row, successorRow, column, successorColumn) => row == successorRow && column == successorColumn - 1
  },
  'SOUTH': {
    'movement': [1, 0],
    'slipDirections': ['EAST', 'WEST'],
    'isAtBoundary': (row, column, grid) => row == grid.height - 1 || grid.map[row + 1][column] == 'W',
    'isValidMove': (row, successorRow, column, successorColumn) => row == successorRow - 1 && column == successorColumn
  },
  'WEST': {
    'movement': [0, -1],
    'slipDirections': ['NORTH', 'SOUTH'],
    'isAtBoundary': (row, column, grid) => column == 0 || grid.map[row][column - 1] == 'W',
    'isValidMove': (row, successorRow, column, successorColumn) => row == successorRow && column == successorColumn + 1
  }
};

function getAdjacentCells(map, row, column, action) {
  const adjacentCells = [];

  for (const slipDirection of actionMap[action].slipDirections) {
    const [rowOffset, columnOffset] = actionMap[slipDirection].movement;
    const adjacentRow = row + rowOffset;
    const adjacentColumn = column + columnOffset;

    if (adjacentRow in map && adjacentColumn in map[adjacentRow]) {
      const adjacentCell = map[adjacentRow][adjacentColumn];
      if (adjacentCell != 'W') {
        adjacentCells.push([adjacentRow, adjacentColumn]);
      }
    }
  }

  return adjacentCells;
}

class GridMdp {
  constructor(grid) {
    this._grid = grid;
  }

  states() {
    const size = this._grid.width * this._grid.height;
    return Array(size).keys();
  }

  actions() {
    return Object.keys(actionMap);
  }

  transitionFunction(state, action, successorState) {
    const row = Math.floor(state / this._grid.width);
    const column = state - row * this._grid.width;

    const successorRow = Math.floor(successorState / this._grid.width);
    const successorColumn = successorState - successorRow * this._grid.width;

    if (row == successorRow && column == successorColumn && this._grid.map[row][column] == 'W') {
      return 1;
    }

    const adjacentCells = getAdjacentCells(this._grid.map, row, column, action);
    for (const adjacentCell of adjacentCells) {
      const [adjacentRow, adjacentColumn] = adjacentCell;
      if (adjacentRow == successorRow && adjacentColumn == successorColumn) {
        return this._grid.slipProbability / adjacentCells.length;
      }
    }

    const adjustment = adjacentCells.length > 0 ? this._grid.slipProbability : 0;

    const isAtBoundary = actionMap[action].isAtBoundary(row, column, this._grid);
    if (row == successorRow && column == successorColumn && isAtBoundary) {
      return 1 - adjustment;
    }

    if (this._grid.map[successorRow][successorColumn] == 'W') {
      return 0;
    }

    const isValidMove = actionMap[action].isValidMove(row, successorRow, column, successorColumn);
    if (isValidMove) {
      return 1 - adjustment;
    }

    return 0;
  }

  rewardFunction(state, action) {
    const row = Math.floor(state / this._grid.width);
    const column = state - row * this._grid.width;

    const cell = this._grid.map[row][column];

    return cell == 'G' && action == 'STAY' ? 1 : -1;
  }

  startState() {
    return this._grid.width * this._grid.position.row + this._grid.position.column;
  }
}

module.exports = GridMdp;
