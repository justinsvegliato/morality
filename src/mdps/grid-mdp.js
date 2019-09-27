'use strict';

class GridMdp {
  constructor(grid) {
    this._grid = grid;
  }

  states() {
    const size = this._grid.width * this._grid.height;
    return Array(size).keys();
  }

  actions() {
    return ['NORTH', 'EAST', 'SOUTH', 'WEST', 'STAY'];
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
      if (row == successorRow && column == successorColumn && row == 0) {
        return 1;
      }
      if (row == successorRow + 1 && column == successorColumn) {
        return 1;
      }
      return 0;
    }

    if (action == 'EAST') {
      if (row == successorRow && column == successorColumn && column == this._grid.width - 1) {
        return 1;
      }
      if (row == successorRow && column == successorColumn - 1) {
        return 1;
      }
      return 0;
    }

    if (action == 'SOUTH') {
      if (row == successorRow && column == successorColumn && row == this._grid.height - 1) {
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
  }

  rewardFunction(state, action) {
    const row = Math.floor(state / this._grid.width);
    const column = state - row * this._grid.width;

    const cell = this._grid.map[row][column];

    return cell == 'G' && action == 'STAY' ? 1 : -1;
  }

  startState() {
    return this._grid.height * this._grid.position.row + this._grid.position.column;
  }
}

module.exports = GridMdp;
