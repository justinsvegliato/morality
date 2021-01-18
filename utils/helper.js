'use strict';

function samer(agent, moralCommunity, memberStatePrior) {
  const triples = [];

  for (const state of agent.states()) {
    for (const memberState of moralCommunity[0].states()) {
      const priorProbability = memberStatePrior(state, memberState);
      if (priorProbability == 0) {
        continue;
      } 
      for (const successorState of agent.states()) {
        for (const action of agent.actions()) {
          const transitionProbability = agent.transitionFunction(state, action, successorState);
          if (transitionProbability == 0) {
            continue;
          } 
          triples.push([state, successorState, memberState])
          break;
        }
      }
    }
  }
 
  return triples;
}

module.exports = {
  samer
};
