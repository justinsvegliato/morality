'use strict';

const Mdp = require('./mdp.js');
const fs = require('fs');

function getGrid(filename) {
  const file = fs.readFileSync(filename).toString();
  const lines = file.split('\n');

  const grid = [];

  for (const line of lines) {
    const row = line.split('');
    grid.push(row);
  }

  return grid;
}

function getLineMdp(size) {
  const states = Array.from(Array(size).keys());

  const actions = ['LEFT', 'STAY', 'RIGHT'];

  const transitionFunction = function(state, action, successorState) {
    if (action == 'STAY') {
      if (state == successorState) {
        return 1.0;
      }
      return 0.0;
    }

    if (action == 'LEFT') {
      if (state == 0 && state == successorState) {
        return 1.0;
      }
      if (state - 1 == successorState) {
        return 0.9;
      }
      if (state == successorState) {
        return 0.1;
      }
      return 0.0;
    }

    if (action == 'RIGHT') {
      if (state == size - 1 && state == successorState) {
        return 1.0;
      }
      if (state + 1 == successorState) {
        return 0.9;
      }
      if (state == successorState) {
        return 0.1;
      }
      return 0.0;
    }
  };

  const rewardFunction = function(state, action) {
    if (action == 'STAY') {
      if (state == size - 1) {
        return 1;
      }
      return -1;
    }

    if (action == 'LEFT' || action == 'RIGHT') {
      return -1;
    }
  };

  const startState = 0;

  const discountFactor = 0.99;

  return new Mdp(states, actions, transitionFunction, rewardFunction, startState, discountFactor);
}

function printStates(mdp) {
  console.log('States');

  for (const state of mdp.states) {
    console.log(`  State: ${state}`);
  }
}

function printActions(mdp) {
  console.log('Actions');

  for (const action of mdp.actions) {
    console.log(`  Action: ${action}`);
  }
}

function printTransitionFunction(mdp) {
  console.log('Transition Function');

  let isValid = true;

  for (const state of mdp.states) {
    for (const action of mdp.actions) {
      console.log(`  Transition: (${state}, ${action})`);

      let totalProbability = 0;

      for (const successorState of mdp.states) {
        const probability = mdp.transitionFunction(state, action, successorState);
        totalProbability += probability;
        console.log(`    Successor State: ${successorState} -> ${probability}`);
      }

      isValid = isValid && totalProbability == 1;
      console.log(`    Total Probability: ${totalProbability}`);
    }
  }

  console.log(`  Status: ${isValid ? 'Valid' : 'Invalid'}`)
}

function printRewardFunction(mdp) {
  console.log('Reward Function');

  for (const state of mdp.states) {
    console.log(`  State: ${state}`);

    for (const action of mdp.actions) {
      const reward = mdp.rewardFunction(state, action);
      console.log(`    Action: ${action} -> ${reward}`);
    }
  }
}

function printStartState(mdp) {
  console.log(`Start State: ${mdp.startState}`);
}

function printDiscountFactor(mdp) {
  console.log(`Discount Factor: ${mdp.discountFactor}`);
}

function printMdp(mdp) {
  printStates(mdp);
  printActions(mdp);
  printTransitionFunction(mdp);
  printRewardFunction(mdp);
  printStartState(mdp);
  printDiscountFactor(mdp);
}

module.exports = {
  getGrid,
  getLineMdp,
  printStates,
  printActions,
  printTransitionFunction,
  printRewardFunction,
  printStartState,
  printDiscountFactor,
  printMdp,
};
