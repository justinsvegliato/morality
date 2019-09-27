'use strict';

class GridMdp {
  constructor(grid, discountFactor) {
    this._grid = grid;
    this._discountFactor = discountFactor;
  }

  get states() {
    let size = 0;

    for (const row of this._grid) {
      size += row.length;
    }

    return Array.from(Array(size).keys());
  }

  get actions() {
    return ['NORTH', 'EAST', 'SOUTH', 'WEST', 'STAY'];
  }

  get transitionFunction() {
    const grid = this._grid;

    const transitionFunction = function(state, action, successorState) {
      const height = grid.length;
      const width = grid[0].length;

      const row = parseInt(state / width);
      const column = parseInt(state - row * width);

      const successorRow = parseInt(successorState / width);
      const successorColumn = parseInt(successorState - successorRow * width);

      if (action == 'STAY') {
        if (row == successorRow && column == successorColumn) {
          return 1;
        }
        return 0;
      }

      if (action == 'NORTH') {
        if (row == successorRow && column == successorColumn && row == 0) {
          return 1;
        }
        if (row == successorRow + 1 && column == successorColumn) {
          return 1;
        }
        return 0;
      }

      if (action == 'EAST') {
        if (row == successorRow && column == successorColumn && column == width - 1) {
          return 1;
        }
        if (row == successorRow && column == successorColumn - 1) {
          return 1;
        }
        return 0;
      }

      if (action == 'SOUTH') {
        if (row == successorRow && column == successorColumn && row == height - 1) {
          return 1;
        }
        if (row == successorRow - 1 && column == successorColumn) {
          return 1;
        }
        return 0;
      }

      if (action == 'WEST') {
        if (row == successorRow && column == successorColumn && column == 0) {
          return 1;
        }
        if (row == successorRow && column == successorColumn + 1) {
          return 1;
        }
        return 0;
      }
    };

    return transitionFunction;
  }

  get rewardFunction() {
    const grid = this._grid;

    const rewardFunction = function(state, action) {
      const width = grid[0].length;
      const row = parseInt(state / width);
      const column = parseInt(state - row * width);

      const cell = grid[row][column];

      if (cell == 'G' && action == 'STAY') {
        return 100;
      }
      return -1;
    };

    return rewardFunction;
  }

  get startState() {
    for (let i = 0; i < this._grid.length; i++) {
      for (let j = 0; j < this._grid[i].length; j++) {
        const cell = this._grid[i][j];
        if (cell == 'S') {
          return this._grid[i].length * i + j;
        }
      }
    }
    return -1;
  }

  get discountFactor() {
    return this._discountFactor;
  }
}

module.exports = GridMdp;
