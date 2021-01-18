'use strict';

function samer(agent, moralCommunity, memberStatePrior) {
  const states = [];
  const successorStates = [];
  const memberStates = [];

  for (const state of agent.states()) {
    for (const action of agent.actions()) {
      for (const member of moralCommunity) {
        for (const memberState of member.states()) {
          const priorProbability = memberStatePrior(state, memberState);
          if (priorProbability == 0) {
            continue;
          } 
          for (const successorState of agent.states()) {
            const transitionProbability = agent.transitionFunction(state, action, successorState);
            if (transitionProbability > 0) {
              console.log(transitionProbability)
            }
            if (transitionProbability == 0) {
              continue;
            } 
            states.push(state);
            successorStates.push(successorState);
            memberStates.push(memberState);
          }
        }
      }
    }
  }
 
  return {
    'states': states,
    'successorStates': successorStates, 
    'memberStates': memberStates, 
    'memberSuccessorStates': agent.states()
  };
}

module.exports = {
  samer
};
