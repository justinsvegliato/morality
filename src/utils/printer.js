'use strict';

function printStates(mdp) {
  console.log('States');

  for (const state of mdp.states()) {
    console.log(`  State: ${state}`);
  }
}

function printActions(mdp) {
  console.log('Actions');

  for (const action of mdp.actions()) {
    console.log(`  Action: ${action}`);
  }
}

function printTransitionFunction(mdp) {
  console.log('Transition Function');

  let isValid = true;

  for (const state of mdp.states()) {
    for (const action of mdp.actions()) {
      console.log(`  Transition: (${state}, ${action})`);

      let totalProbability = 0;

      for (const successorState of mdp.states()) {
        const probability = mdp.transitionFunction(state, action, successorState);
        totalProbability += probability;
        console.log(`    Successor State: ${successorState} -> ${probability}`);
      }

      isValid = isValid && totalProbability == 1;
      console.log(`    Total Probability: ${totalProbability}`);
    }
  }

  console.log(`  Status: ${isValid ? 'Valid' : 'Invalid'}`);
}

function printRewardFunction(mdp) {
  console.log('Reward Function');

  for (const state of mdp.states()) {
    console.log(`  State: ${state}`);

    for (const action of mdp.actions()) {
      const reward = mdp.rewardFunction(state, action);
      console.log(`    Action: ${action} -> ${reward}`);
    }
  }
}

function printStartState(mdp) {
  console.log(`Start State: ${mdp.startState()}`);
}

function printMdp(mdp) {
  printStates(mdp);
  printActions(mdp);
  printTransitionFunction(mdp);
  printRewardFunction(mdp);
  printStartState(mdp);
}

function printPolicy(grid, ethicalContext, policy) {
  const symbols = {
    'STAY': '\u2205',
    'NORTH': '\u2191',
    'EAST': '\u2192',
    'SOUTH': '\u2193',
    'WEST': '\u2190'
  };

  for (let row = 0; row < grid.height; row++) {
    let representation = '';
    for (let column = 0; column < grid.width; column++) {
      const state = grid.width * row + column;
      if (grid.map[row][column] == 'W') {
        representation += '\u25A0';
      } else if (grid.map[row][column] == 'G') {
        representation += '\u272A';
      } else if (ethicalContext.forbiddenStates.includes(state)) {
        representation += '\u2A09';
      } else {
        representation += symbols[policy[state]];
      }
      representation += ' ';
    }
    console.log(`${representation}`);
  }
}

module.exports = {
  printStates,
  printActions,
  printTransitionFunction,
  printRewardFunction,
  printStartState,
  printMdp,
  printPolicy
};
