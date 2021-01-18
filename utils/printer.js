'use strict';

const ERROR_THRESHOLD = 0.001


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
      console.log(`  Transition: (${Object.values(mdp.getStateFactorsFromState(state)).join('_')}, ${action})`);

      let totalProbability = 0;

      for (const successorState of mdp.states()) {
        const probability = mdp.transitionFunction(state, action, successorState);
        totalProbability += probability;
        console.log(`    Successor State: ${Object.values(mdp.getStateFactorsFromState(successorState)).join('_')} -> ${probability}`);
      }

      isValid = isValid && totalProbability == 1;
      console.log(`    Total Probability: ${totalProbability}`);

      if (!isValid) {
        return
      }
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

function printMemberStatePrior(mdp, memberStatePrior) {
  console.log('Member State Prior');

  let isValid = true;

  for (const state of mdp.states()) {
    console.log(`  Agent State: (${Object.values(mdp.getStateFactorsFromState(state)).join('_')})`);

    let totalProbability = 0;

    for (const memberState of mdp.states()) {
      const probability = memberStatePrior(state, memberState);
      console.log(`    Member State: ${Object.values(mdp.getStateFactorsFromState(memberState)).join('_')} -> ${probability}`);
      totalProbability += probability;
    }

    isValid = isValid && Math.abs(totalProbability - 1.0) <= ERROR_THRESHOLD;
    console.log(`    Total Probability: ${totalProbability}`);

    if (!isValid) {
      return;
    }
  }

  console.log(`  Status: ${isValid ? 'Valid' : 'Invalid'}`);
}

function printEstablishEffects(mdp, triples, memberSuccessorStates, establishEffects) {
  console.log('Establish Effects');

  let isValid = true;

  for (const triple of triples) {
    const state = triple[0];
    const successorState = triple[1];
    const memberState = triple[2];

    console.log(`  Agent State: (${Object.values(mdp.getStateFactorsFromState(state)).join('_')})`);
    console.log(`  Agent Successor State: (${Object.values(mdp.getStateFactorsFromState(successorState)).join('_')})`);
    console.log(`  Member State: (${Object.values(mdp.getStateFactorsFromState(memberState)).join('_')})`);

    let totalProbability = 0;

    for (const memberSuccessorState of memberSuccessorStates) {
      const probability = establishEffects(state, successorState, memberState, memberSuccessorState);
      console.log(`    Member Successor State: ${Object.values(mdp.getStateFactorsFromState(memberSuccessorState)).join('_')} -> ${probability}`);
      totalProbability += probability;
    }

    isValid = isValid && Math.abs(totalProbability - 1.0) <= ERROR_THRESHOLD;
    console.log(`    Total Probability: ${totalProbability}`);

    if (!isValid) {
      return
    }
  }

  console.log(`  Status: ${isValid ? 'Valid' : 'Invalid'}`);
}

module.exports = {
  printStates,
  printActions,
  printTransitionFunction,
  printRewardFunction,
  printStartStates,
  printMdp,
  printGridWorldDomain,
  printGridWorldPolicy,
  printMemberStatePrior,
  printEstablishEffects
};
