'use strict';

const slips = {
  'NORTH': [[0, 1], [0, -1]],
  'EAST': [[1, 0], [-1, 0]],
  'SOUTH': [[0, 1], [0, -1]],
  'WEST': [[1, 0], [-1, 0]]
};

function getAdjacentCells(map, row, column, action) {
  const adjacentCells = [];

  for (const slip of slips[action]) {
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

    const probability = adjacentCells.length > 0 ? 1 - this._grid.slipProbability : 1;

    if (action == 'NORTH') {
      if (row == successorRow && column == successorColumn && (row == 0 || this._grid.map[row - 1][column] == 'W')) {
        return probability;
      }
      if (row == successorRow + 1 && column == successorColumn && this._grid.map[successorRow][successorColumn] != 'W') {
        return probability;
      }
      return 0;
    }

    if (action == 'EAST') {
      if (row == successorRow && column == successorColumn && (column == this._grid.width - 1 || this._grid.map[row][column + 1] == 'W')) {
        return probability;
      }
      if (row == successorRow && column == successorColumn - 1 && this._grid.map[successorRow][successorColumn] != 'W') {
        return probability;
      }
      return 0;
    }

    if (action == 'SOUTH') {
      if (row == successorRow && column == successorColumn && (row == this._grid.height - 1 || this._grid.map[row + 1][column] == 'W')) {
        return probability;
      }
      if (row == successorRow - 1 && column == successorColumn && this._grid.map[successorRow][successorColumn] != 'W') {
        return probability;
      }
      return 0;
    }

    if (action == 'WEST') {
      if (row == successorRow && column == successorColumn && (column == 0 || this._grid.map[row][column - 1] == 'W')) {
        return probability;
      }
      if (row == successorRow && column == successorColumn + 1 && this._grid.map[successorRow][successorColumn] != 'W') {
        return probability;
      }
      return 0;
    }
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
