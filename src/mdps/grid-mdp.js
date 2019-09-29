'use strict';

const offsets = {
  'NORTH': [
    [1, 0],
    [0, 1],
    [0, -1]
  ],
  'EAST': [
    [1, 0],
    [-1, 0],
    [0, -1]
  ],
  'SOUTH': [
    [-1, 0],
    [0, 1],
    [0, -1]
  ],
  'WEST': [
    [1, 0],
    [-1, 0],
    [0, 1]
  ]
};

function getNeighboringCells(grid, row, column, action) {
  const adjacentCells = [];

  for (const offset of offsets[action]) {
    const [rowOffset, columnOffset] = offset;
    const adjacentRow = row + rowOffset;
    const adjacentColumn = column + columnOffset;

    if (adjacentRow in grid.map && adjacentColumn in grid.map[adjacentRow]) {
      const adjacentCell = grid.map[adjacentRow][adjacentColumn];
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

    if (action == 'NORTH') {
      const adjacentCells = getNeighboringCells(this._grid, row, column, action);

      for (const adjacentCell of adjacentCells) {
        const [adjacentRow, adjacentColumn] = adjacentCell;
        if (adjacentRow == successorRow && adjacentColumn == successorColumn) {
          return this._grid.slipProbability / adjacentCells.length;
        }
      }

      const probability = adjacentCells.length > 0 ? 1 - this._grid.slipProbability : 1;

      if (row == successorRow && column == successorColumn && row == 0) {
        return probability;
      }
      if (row == successorRow && column == successorColumn && this._grid.map[row - 1][column] == 'W') {
        return probability;
      }
      if (row == successorRow + 1 && column == successorColumn && this._grid.map[successorRow][successorColumn] != 'W') {
        return probability;
      }
      return 0;
    }

    if (action == 'EAST') {
      const adjacentCells = getNeighboringCells(this._grid, row, column, action);

      for (const adjacentCell of adjacentCells) {
        const [adjacentRow, adjacentColumn] = adjacentCell;
        if (adjacentRow == successorRow && adjacentColumn == successorColumn) {
          return this._grid.slipProbability / adjacentCells.length;
        }
      }

      const probability = adjacentCells.length > 0 ? 1 - this._grid.slipProbability : 1;

      if (row == successorRow && column == successorColumn && column == this._grid.width - 1) {
        return probability;
      }
      if (row == successorRow && column == successorColumn && this._grid.map[row][column + 1] == 'W') {
        return probability;
      }
      if (row == successorRow && column == successorColumn - 1 && this._grid.map[successorRow][successorColumn] != 'W') {
        return probability;
      }
      return 0;
    }

    if (action == 'SOUTH') {
      const adjacentCells = getNeighboringCells(this._grid, row, column, action);

      for (const adjacentCell of adjacentCells) {
        const [adjacentRow, adjacentColumn] = adjacentCell;
        if (adjacentRow == successorRow && adjacentColumn == successorColumn) {
          return this._grid.slipProbability / adjacentCells.length;
        }
      }

      const probability = adjacentCells.length > 0 ? 1 - this._grid.slipProbability : 1;

      if (row == successorRow && column == successorColumn && row == this._grid.height - 1) {
        return probability;
      }
      if (row == successorRow && column == successorColumn && this._grid.map[row + 1][column] == 'W') {
        return probability;
      }
      if (row == successorRow - 1 && column == successorColumn && this._grid.map[successorRow][successorColumn] != 'W') {
        return probability;
      }
      return 0;
    }

    if (action == 'WEST') {
      const adjacentCells = getNeighboringCells(this._grid, row, column, action);

      for (const adjacentCell of adjacentCells) {
        const [adjacentRow, adjacentColumn] = adjacentCell;
        if (adjacentRow == successorRow && adjacentColumn == successorColumn) {
          return this._grid.slipProbability / adjacentCells.length;
        }
      }

      const probability = adjacentCells.length > 0 ? 1 - this._grid.slipProbability : 1;

      if (row == successorRow && column == successorColumn && column == 0) {
        return probability;
      }
      if (row == successorRow && column == successorColumn && this._grid.map[row][column - 1] == 'W') {
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
