'use strict';

const morality = require('../../morality.js');
const LaneMergingAgent = require('../../agents/lane-merging-agent.js');
const TheGoldenRule = require('../../ethics/the-golden-rule.js');
const printer = require('../../utils/printer.js');
const helper = require('../../utils/helper.js');

const num_mergers = 2;
const num_mergees = 2;
const agent = new LaneMergingAgent(num_mergers, num_mergees);

console.log('Amoral Policy');
const amoralSolution = morality.solve(agent);
if (amoralSolution) {
  console.log(amoralSolution.policy);
}

const moralCommunity = [];
for (let i = 0; i < (num_mergers + num_mergees) - 1; i++) {
  moralCommunity.push({states: () => agent.states(), values: amoralSolution.values});
}

//TODO: could make a seperate file with these functions instead of duplicating for both AU and TGR
function establishEffects(state, successor_state, member_state, member_successor_state) {
  const valid_states = agent.startStates();
  const state_factors = agent.getStateFactorsFromState(state);
  const succ_state_factors = agent.getStateFactorsFromState(successor_state);
  const member_state_factors = agent.getStateFactorsFromState(member_state);
  const member_succ_state_factors = agent.getStateFactorsFromState(member_successor_state);

  // Agent is already at the goal 
  if (state_factors['is_goal']) {
    if (member_state == member_successor_state) {
      return 1.0;
    }
    else {
      return 0.0;
    }
  }

  // Other agent is already at the goal
  if (member_state_factors['is_goal']) {
    if (member_state == member_successor_state) {
      return 1.0;
    }
    else {
      return 0.0;
    }
  }

  // Other agent will arrive at goal 
  if (member_succ_state_factors['is_goal']) {
    if (member_state_factors['position'] == 1) {
      if ((member_state_factors['lane_id'] == 'MERGER') &&
          (state_factors['num_mergers_remaining'] == succ_state_factors['num_mergers_remaining'] + 1)) {
        return 1.0;
      }
      if ((member_state_factors['lane_id'] == 'MERGEE') &&
          (state_factors['num_mergees_remaining'] == succ_state_factors['num_mergees_remaining'] + 1)) {
        return 1.0;
      }
    }
  }

  // Agent is waiting to merge
  if (succ_state_factors['is_goal']) {
    if (state_factors['lane_id'] == 'MERGER') {
      if ((member_state_factors['num_mergers_remaining'] == member_succ_state_factors['num_mergers_remaining'] + 1) &&
          (member_state_factors['num_mergees_remaining'] == member_succ_state_factors['num_mergees_remaining'])) {
        if (member_state_factors['lane_id'] == 'MERGER' && member_succ_state_factors['lane_id'] == 'MERGER') {
          if ((member_state_factors['position'] == (member_succ_state_factors['position'] + 1)) &&
              (member_succ_state_factors['is_moving'] == true)) {
            return 1.0;
          }
        }
        else if (member_state_factors['lane_id'] == 'MERGEE' && member_succ_state_factors['lane_id'] == 'MERGEE') {
          if ((member_state_factors['position'] == (member_succ_state_factors['position'])) &&
              (member_succ_state_factors['is_moving'] == false)) {
            return 1.0;
          }
        }
      }
    }
    else {
      if ((member_state_factors['num_mergers_remaining'] == member_succ_state_factors['num_mergers_remaining']) &&
          (member_state_factors['num_mergees_remaining'] == member_succ_state_factors['num_mergees_remaining']  + 1)) {
        if (member_state_factors['lane_id'] == 'MERGEE' && member_succ_state_factors['lane_id'] == 'MERGEE') {
          if ((member_state_factors['position'] == (member_succ_state_factors['position'] + 1)) &&
              (member_succ_state_factors['is_moving'] == true)) {
            return 1.0;
          }
        }
        else if (member_state_factors['lane_id'] == 'MERGER' && member_succ_state_factors['lane_id'] == 'MERGER') {
          if ((member_state_factors['position'] == (member_succ_state_factors['position'])) &&
              (member_succ_state_factors['is_moving'] == false)) {
            return 1.0;
          }
        }
      }
    }
    return 0.0;
  }

  // Handle all invalid states
  if (!valid_states.includes(state)) {
    if (state == member_successor_state) {
      return 1.0;
    }
    else {
      return 0.0;
    }
  }

  // Neither state nor successor state is the goal
  let successors_match = false;
  if ((succ_state_factors['num_mergers_remaining'] == member_succ_state_factors['num_mergers_remaining']) &&
      (succ_state_factors['num_mergees_remaining'] == member_succ_state_factors['num_mergees_remaining'])) {
    if (((succ_state_factors['lane_id'] == member_succ_state_factors['lane_id']) &&
         (succ_state_factors['is_moving'] == member_succ_state_factors['is_moving'])) ||
        ((succ_state_factors['lane_id'] != member_succ_state_factors['lane_id']) &&
         (succ_state_factors['is_moving'] != member_succ_state_factors['is_moving']))) {
      successors_match = true;
    }
  }

  let initials_match = false;
  if ((state_factors['num_mergers_remaining'] == member_state_factors['num_mergers_remaining']) &&
      (state_factors['num_mergees_remaining'] == member_state_factors['num_mergees_remaining'])) {
    if (((state_factors['lane_id'] == member_state_factors['lane_id']) &&
         (state_factors['is_moving'] == member_state_factors['is_moving'])) ||
        ((state_factors['lane_id'] != member_state_factors['lane_id']) &&
         (state_factors['is_moving'] != member_state_factors['is_moving']))) {
      initials_match = true;
    }
  }

  if (!successors_match || !initials_match) {
    return 0.0;
  }

  if (succ_state_factors['lane_id'] == 'MERGER') {
    if ((member_state_factors['num_mergers_remaining'] == member_succ_state_factors['num_mergers_remaining'] + 1) &&
        (member_state_factors['num_mergees_remaining'] == member_succ_state_factors['num_mergees_remaining'])) {
      if (member_state_factors['lane_id'] == 'MERGER' && member_succ_state_factors['lane_id'] == 'MERGER') {
        if ((member_state_factors['position'] == (member_succ_state_factors['position'] + 1)) &&
            (member_succ_state_factors['is_moving'] == true)) {
          return 1.0;
        }
      }
      else if (member_state_factors['lane_id'] == 'MERGEE' && member_succ_state_factors['lane_id'] == 'MERGEE') {
        if ((member_state_factors['position'] == (member_succ_state_factors['position'])) &&
            (member_succ_state_factors['is_moving'] == false)) {
          return 1.0;
        }
      }
    }
    else if ((member_state_factors['num_mergers_remaining'] == member_succ_state_factors['num_mergers_remaining']) &&
             (member_state_factors['num_mergees_remaining'] == member_succ_state_factors['num_mergees_remaining'] + 1)) {
      if (member_state_factors['lane_id'] == 'MERGER' && member_succ_state_factors['lane_id'] == 'MERGER') {
        if ((member_state_factors['position'] == (member_succ_state_factors['position'])) &&
            (member_succ_state_factors['is_moving'] == false)) {
          return 1.0;
        }
      }
      else if (member_state_factors['lane_id'] == 'MERGEE' && member_succ_state_factors['lane_id'] == 'MERGEE') {
        if ((member_state_factors['position'] == (member_succ_state_factors['position'] + 1)) &&
            (member_succ_state_factors['is_moving'] == true)) {
          return 1.0;
        }
      }
    }
  }
  else {
    if ((member_state_factors['num_mergers_remaining'] == member_succ_state_factors['num_mergers_remaining']) &&
        (member_state_factors['num_mergees_remaining'] == member_succ_state_factors['num_mergees_remaining'] + 1)) {
      if (member_state_factors['lane_id'] == 'MERGEE' && member_succ_state_factors['lane_id'] == 'MERGEE') {
        if ((member_state_factors['position'] == (member_succ_state_factors['position'] + 1)) &&
            (member_succ_state_factors['is_moving'] == true)) {
          return 1.0;
        }
      }
      else if (member_state_factors['lane_id'] == 'MERGER' && member_succ_state_factors['lane_id'] == 'MERGER') {
        if ((member_state_factors['position'] == (member_succ_state_factors['position'])) &&
            (member_succ_state_factors['is_moving'] == false)) {
          return 1.0;
        }
      }
    }
    else if ((member_state_factors['num_mergers_remaining'] == member_succ_state_factors['num_mergers_remaining'] + 1) &&
             (member_state_factors['num_mergees_remaining'] == member_succ_state_factors['num_mergees_remaining'])) {
      if (member_state_factors['lane_id'] == 'MERGEE' && member_succ_state_factors['lane_id'] == 'MERGEE') {
        if ((member_state_factors['position'] == (member_succ_state_factors['position'])) &&
            (member_succ_state_factors['is_moving'] == false)) {
          return 1.0;
        }
      }
      else if (member_state_factors['lane_id'] == 'MERGER' && member_succ_state_factors['lane_id'] == 'MERGER') {
        if ((member_state_factors['position'] == (member_succ_state_factors['position'] + 1)) &&
            (member_succ_state_factors['is_moving'] == true)) {
          return 1.0;
        }
      }
    }
  }
  return 0.0;
}

function memberStatePrior(state, member_state) {
  const valid_states = agent.startStates();
  const moral_community_size = moralCommunity.length;
  const state_factors = agent.getStateFactorsFromState(state);
  const member_state_factors = agent.getStateFactorsFromState(member_state);
  if (state_factors['is_goal'] &&
      (valid_states.includes(member_state) || member_state_factors['is_goal'])) {
    return 1.0 / (valid_states.length + 1);
  }
  else {
    if (state_factors['is_goal'] ) {
      return 0.0;
    }
  }

  if (!valid_states.includes(state)) {
    if (state == member_state) {
      return 1.0;
    }
    else {
      return 0.0;
    }
  }

  if (state == member_state) {
    return 0.0;
  }

  if (!valid_states.includes(member_state) && !member_state_factors['is_goal']) {
    return 0.0;
  }

  // -1 since we know we are not at the goal
  const num_possible_states_excluding_goal = state_factors['num_mergers_remaining'] +
                                             state_factors['num_mergees_remaining'] - 1;
  if (member_state_factors['is_goal']) {
    return (moral_community_size - (num_possible_states_excluding_goal)) / moral_community_size;
  }

  // If member state is compatible with state
  if ((state_factors['num_mergers_remaining'] == member_state_factors['num_mergers_remaining']) &&
      (state_factors['num_mergees_remaining'] == member_state_factors['num_mergees_remaining'])) {
    if (((state_factors['lane_id'] == member_state_factors['lane_id']) &&
         (state_factors['is_moving'] == member_state_factors['is_moving'])) ||
        ((state_factors['lane_id'] != member_state_factors['lane_id']) &&
         (state_factors['is_moving'] != member_state_factors['is_moving']))) {
      return 1.0 / moral_community_size;
    }
  }
  return 0.0;
}

// ALL APPEAR VALID
//printer.printTransitionFunction(agent);
//printer.printMemberStatePrior(agent, memberStatePrior);

//const triples = helper.samer(agent, moralCommunity, memberStatePrior);
//console.log(triples)

//printer.printEstablishEffects(agent, triples, moralCommunity[0].states(), establishEffects);

const golden_slack_factor = 5000;
//const golden_slack_factor = 5;
const ethics = new TheGoldenRule(moralCommunity, establishEffects, memberStatePrior, golden_slack_factor);

console.log('Moral Policy');
const moralSolution = morality.solve(agent, ethics, true);
if (moralSolution) {
  console.log(moralSolution.policy);
}
