'use strict';

function printStates(mdp) {
  console.log('States');

  mdp.states().forEach(function(state, index) {
    console.log(`  State ${index}: ${state}`);
  });
}

function printActions(mdp) {
  console.log('Actions');

  mdp.actions().forEach(function(action, index) {
    console.log(`  Action ${index}: ${action}`);
  });
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

function printStartStates(mdp) {
  console.log(`Start States: ${mdp.startStates()}`);
}

function printMdp(mdp) {
  printStates(mdp);
  printActions(mdp);
  printTransitionFunction(mdp);
  printRewardFunction(mdp);
  printStartStates(mdp);
}

function printGridWorldDomain(gridWorld, ethics) {
  for (let row = 0; row < gridWorld.length; row++) {
    let text = '';
    for (let column = 0; column < gridWorld[row].length; column++) {
      const state = gridWorld[row].length * row + column;
      if (ethics && ethics.forbiddenStates && ethics.forbiddenStates.includes(state)) {
        text += '\u2A0D';
      } else if (ethics && ethics.violationFunction && ethics.violationFunction(state).length > 0) {
        text += '\u03B7';
      } else if (gridWorld[row][column] == 'W') {
        text += '\u25A0';
      } else if (gridWorld[row][column] == 'G') {
        text += '\u272A';
      } else if (gridWorld[row][column] == 'S') {
        text += '\u229B';
      } else {
        text += '\u25A1';
      }
      text += '  ';
    }
    console.log(`${text}`);
  }
}

function printGridWorldPolicy(gridWorld, policy) {
  const symbols = {
    'STAY': '\u2205',
    'NORTH': '\u2191',
    'EAST': '\u2192',
    'SOUTH': '\u2193',
    'WEST': '\u2190'
  };

  for (let row = 0; row < gridWorld.length; row++) {
    let text = '';
    for (let column = 0; column < gridWorld[row].length; column++) {
      const state = gridWorld[row].length * row + column;
      if (gridWorld[row][column] == 'W') {
        text += '\u25A0';
      } else {
        text += symbols[policy[state]];
      }
      text += '  ';
    }
    console.log(`${text}`);
  }
}

module.exports = {
  printStates,
  printActions,
  printTransitionFunction,
  printRewardFunction,
  printStartStates,
  printMdp,
  printGridWorldDomain,
  printGridWorldPolicy
};
