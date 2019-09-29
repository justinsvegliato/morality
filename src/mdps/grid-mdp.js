'use strict';

const actionInformation = {
  'NORTH': {
    'slips': [[0, 1], [0, -1]],
    'boundaryCondition': function(row, successorRow, column, successorColumn, grid) {
      return row == successorRow && column == successorColumn && (row == 0 || grid.map[row - 1][column] == 'W');
    },
    'movementCondition': function(row, successorRow, column, successorColumn, grid) {
      return row == successorRow + 1 && column == successorColumn && grid.map[successorRow][successorColumn] != 'W';
    }
  },
  'EAST': {
    'slips': [[1, 0], [-1, 0]],
    'boundaryCondition': function(row, successorRow, column, successorColumn, grid) {
      return row == successorRow && column == successorColumn && (column == grid.width - 1 || grid.map[row][column + 1] == 'W');
    },
    'movementCondition': function(row, successorRow, column, successorColumn, grid) {
      return row == successorRow && column == successorColumn - 1 && grid.map[successorRow][successorColumn] != 'W';
    }
  },
  'SOUTH': {
    'slips': [[0, 1], [0, -1]],
    'boundaryCondition': function(row, successorRow, column, successorColumn, grid) {
      return row == successorRow && column == successorColumn && (row == grid.height - 1 || grid.map[row + 1][column] == 'W');
    },
    'movementCondition': function(row, successorRow, column, successorColumn, grid) {
      return row == successorRow - 1 && column == successorColumn && grid.map[successorRow][successorColumn] != 'W';
    }
  },
  'WEST': {
    'slips': [[1, 0], [-1, 0]],
    'boundaryCondition': function(row, successorRow, column, successorColumn, grid) {
      return row == successorRow && column == successorColumn && (column == 0 || grid.map[row][column - 1] == 'W');
    },
    'movementCondition': function(row, successorRow, column, successorColumn, grid) {
      return row == successorRow && column == successorColumn + 1 && grid.map[successorRow][successorColumn] != 'W';
    }
  }
};

function getAdjacentCells(map, row, column, action) {
  const adjacentCells = [];

  for (const slip of actionInformation[action].slips) {
    const [rowSlip, columnSlip] = slip;
    const adjacentRow = row + rowSlip;
    const adjacentColumn = column + columnSlip;

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
    return ['STAY', 'NORTH', 'EAST', 'SOUTH', 'WEST'];
  }

  transitionFunction(state, action, successorState) {
    const row = Math.floor(state / this._grid.width);
    const column = state - row * this._grid.width;

    const successorRow = Math.floor(successorState / this._grid.width);
    const successorColumn = successorState - successorRow * this._grid.width;

    if (action == 'STAY') {
      if (row == successorRow && column == successorColumn) {
        return 1;
      }
      return 0;
    }

    const adjacentCells = getAdjacentCells(this._grid.map, row, column, action);
    for (const adjacentCell of adjacentCells) {
      const [adjacentRow, adjacentColumn] = adjacentCell;
      if (adjacentRow == successorRow && adjacentColumn == successorColumn) {
        return this._grid.slipProbability / adjacentCells.length;
      }
    }

    const boundaryCondition = actionInformation[action].boundaryCondition(row, successorRow, column, successorColumn, this._grid);
    const movementCondition = actionInformation[action].movementCondition(row, successorRow, column, successorColumn, this._grid);
    if (boundaryCondition || movementCondition) {
      const adjustment = adjacentCells.length > 0 ? this._grid.slipProbability : 0;
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
