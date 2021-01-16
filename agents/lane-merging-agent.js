'use strict';

const ACTION_DETAILS = {
  'ALLOW': {},
  'CONTINUE': {},
  'WAIT': {}
};

class LaneMergingAgent {
  constructor(num_mergers, num_mergees) {    
    this._num_merging_members = num_mergers;
    this._num_mergee_members = num_mergees;
    this._num_lanes = 2;
    // min so that we have no "open" spots on the road
    this._num_positions = Math.min(this._num_merging_members, this._num_mergee_members);
    // The 2 is because the agent could be in either lane
    // The other 2 is because the agent's lane could be moving, or not 
    // +1 for the goal state
    // console.log(this._num_merging_members * this._num_mergee_members * 2 * 2 * this.num_pos)
    this._size = this._num_merging_members * this._num_mergee_members * 2 * 2 * this._num_positions + 1;
  }

  states() {
    return [...Array(this._size).keys()];
  }

  actions() {
    return Object.keys(ACTION_DETAILS);
  }

  getStateFactorsFromState(state) {
    let state_factors = {}
    if (state == this._size-1) {
      state_factors['is_goal'] = true;
      state_factors['lane_id'] = 'NONE';
      state_factors['is_moving'] = 'NONE';
      state_factors['position'] = 'NONE';
      state_factors['num_mergers_remaining'] = 'NONE';
      state_factors['num_mergees_remaining'] = 'NONE';
    }
    else {
      state_factors['is_goal'] = false;
      state_factors['lane_id'] = 'MERGER';
      if (state < ((this._size-1) / 2)) {
        state_factors['lane_id'] = 'MERGEE';
      }
      state = state % ((this._size-1) / 2);
      state_factors['is_moving'] = false;
      if (state < ((this._size-1) / 4)) {
        state_factors['is_moving'] = true;
      }
      state = state % (state / 2);
      state_factors['position'] = Math.floor(state / (this._num_merging_members * this._num_mergee_members));
      state = state % (this._num_merging_members * this._num_mergee_members);
      state_factors['num_mergers_remaining'] = Math.floor(state / this._num_merging_members);
      state_factors['num_mergees_remaining'] = state % this._num_merging_members;
    }

    return state_factors;
  }

  // TODO: double check everything
  transitionFunction(state, action, successorState) {
    const state_factors = this.getStateFactorsFromState(state);
    const successor_state_factors = this.getStateFactorsFromState(successorState);
   
    //TODO: figure out how to handle the position state factor...
    // self loop illegal states forever. obvi not the best way to do it... but its much easier index math this way
    if (state_factors['lane_id'] == 'MERGERS' && (state_factors['position'] > state_factors['num_mergers_remaining'])) {
      if (state == successorState) {
        return 1.0;
      }
      else {
        return 0.0;
      }
    }
    if (state_factors['lane_id'] == 'MERGEES' && (state_factors['position'] > state_factors['num_mergees_remaining'])) {
      if (state == successorState) {
        return 1.0;
      }
      else {
        return 0.0;
      }
    }
    
    // self-loop on the goal state forever (the have-merged state)
    if (state_factors['is_goal'] && successor_state_factors['is_goal']) {
      return 1.0;
    }
    if (state_factors['is_goal'] && !successor_state_factors['is_goal']) {
      return 0.0;
    }
    
    // can't switch lanes   
    if (state_factors['lane_id'] != successor_state_factors['lane_id']) {
      return 0.0;
    }

    // can't go backwards
    if (successor_state_factors['position'] > state_factors['position']) {
      return 0.0;
    }

    // can't skip ahead more than one car at a time
    if (state_factors['position'] - successor_state_factors['position'] > 1) {
      return 0.0;
    }

    // can't have more than one car merge each time step
    if (state_factors['num_mergees_remaining'] > successor_state_factors['num_mergees_remaining'] + 1) {
      return 0.0;
    } 
    if (state_factors['num_mergers_remaining'] > successor_state_factors['num_mergers_remaining'] + 1) {
      return 0.0;
    } 
    
    // can't add new cars
    if (state_factors['num_mergees_remaining'] < successor_state_factors['num_mergees_remaining']) {
      return 0.0;
    } 
    if (state_factors['num_mergers_remaining'] < successor_state_factors['num_mergers_remaining']) {
      return 0.0;
    } 

    if ((state_factors['position'] != 0) && !successor_state_factors['is_goal']) { 
      
      // if merger lane is empty, traffic flow is smooth
      if (state_factors['num_mergers_remaining'] == 0) {
        if ((successor_state_factors['num_mergees_remaining'] == state_factors['num_mergees_remaining'] - 1) &&
            (successor_state_factors['position'] == state_factors['position'] - 1) && 
            (state_factors['lane_id'] == 'MERGEE')) {
          return 1.0
        }
        else {
          return 0.0;
        }
      }
  
      // if mergee lane is empty, traffic flow is smooth
      if (state_factors['num_mergees_remaining'] == 0) {
        if ((successor_state_factors['num_mergers_remaining'] == state_factors['num_mergers_remaining'] - 1) &&
            (successor_state_factors['position'] == state_factors['position'] - 1) && 
            (state_factors['lane_id'] == 'MERGER')) {
          return 1.0
        }
        else {
          return 0.0;
        }
      }

      // Dynamics of waiting in line to merge
      if (state_factors['lane_id'] == 'MERGER') {
        if (state_factors['is_moving']) { 
          if ((state_factors['position'] == successor_state_factors['position'] + 1) &&
              (state_factors['num_mergers_remaining'] == successor_state_factors['num_mergers_remaining'] + 1) && 
              (state_factors['num_mergees_remaining'] == successor_state_factors['num_mergees_remaining']) && 
              (successor_state_factors['is_moving'])) {
            return 0.4;
          }
          if ((state_factors['position'] == successor_state_factors['position']) &&
              (state_factors['num_mergers_remaining'] == successor_state_factors['num_mergers_remaining']) &&
              (state_factors['num_mergees_remaining'] == successor_state_factors['num_mergees_remaining'] + 1) &&
              (!successor_state_factors['is_moving'])) {
            return 0.6;
          }
        }
        else { 
          if ((state_factors['position'] == successor_state_factors['position'] + 1) &&
              (state_factors['num_mergers_remaining'] == successor_state_factors['num_mergers_remaining'] + 1) && 
              (state_factors['num_mergees_remaining'] == successor_state_factors['num_mergees_remaining']) && 
              (successor_state_factors['is_moving'])) {
            return 0.3;
          }
          if ((state_factors['position'] == successor_state_factors['position']) &&
              (state_factors['num_mergers_remaining'] == successor_state_factors['num_mergers_remaining']) &&
              (state_factors['num_mergees_remaining'] == successor_state_factors['num_mergees_remaining'] + 1) &&
              (!successor_state_factors['is_moving'])) {
            return 0.7;
          }
        }
      }
      else {
        if (state_factors['is_moving']) {
          if ((state_factors['position'] == successor_state_factors['position'] + 1) &&
              (state_factors['num_mergers_remaining'] == successor_state_factors['num_mergers_remaining'] + 1) && 
              (state_factors['num_mergees_remaining'] == successor_state_factors['num_mergees_remaining']) && 
              (successor_state_factors['is_moving'])) {
            return 0.3;
          }
          if ((state_factors['position'] == successor_state_factors['position']) &&
              (state_factors['num_mergers_remaining'] == successor_state_factors['num_mergers_remaining']) &&
              (state_factors['num_mergees_remaining'] == successor_state_factors['num_mergees_remaining'] + 1) &&
              (!successor_state_factors['is_moving'])) {
            return 0.7;
          }
        }
        else {
          if ((state_factors['position'] == successor_state_factors['position'] + 1) &&
              (state_factors['num_mergers_remaining'] == successor_state_factors['num_mergers_remaining'] + 1) && 
              (state_factors['num_mergees_remaining'] == successor_state_factors['num_mergees_remaining']) && 
              (successor_state_factors['is_moving'])) {
            return 0.4;
          }
          if ((state_factors['position'] == successor_state_factors['position']) &&
              (state_factors['num_mergers_remaining'] == successor_state_factors['num_mergers_remaining']) &&
              (state_factors['num_mergees_remaining'] == successor_state_factors['num_mergees_remaining'] + 1) &&
              (!successor_state_factors['is_moving'])) {
            return 0.6;
          }
        }
      }
      return 0.0;
    }

    // NOTE: the only cases to get here should have position = 0
    // if road is empty, go directly to the goal
    if (state_factors['num_mergers_remaining'] + state_factors['num_mergees_remaining'] == 1) {
      if (successor_state_factors['is_moving']) {
        return 1.0;
      }
      else {
        return 0.0;
      }
    }
   
    //TODO: double check that position is used correctly / resolve what happens at position 0/1
    // double check that we don't want to add any extra dynamics here like awkward merges holding up traffic
    if (state_factors['lane_id'] == 'MERGEE') {
      if (action == 'CONTINUE') {
        if (successor_state_factors['is_goal'] == true) {
          return 1.0;
        }
        else {
          return 0.0;
        }
      }
      if (action == 'ALLOW' || action == 'WAIT') {
        if ((state_factors['num_mergers_remaining'] == successor_state_factors['num_mergers_remaining'] + 1) && 
            (state_factors['num_mergees_remaining'] == successor_state_factors['num_mergees_remaining']) && 
            (!successor_state_factors['is_moving']) &&
            (successor_state_factors['position'] == 0)) {
          return 1.0;
        }
        else {
          return 0.0;
        }
      }
    }
    else {
      if (state_factors['is_moving']) { 
        if (successor_state_factors['is_goal']) {
          return 0.4;
        }
        if ((state_factors['position'] == successor_state_factors['position']) &&
            (state_factors['num_mergers_remaining'] == successor_state_factors['num_mergers_remaining']) &&
            (state_factors['num_mergees_remaining'] == successor_state_factors['num_mergees_remaining'] + 1) &&
            (!successor_state_factors['is_moving'])) {
          return 0.6;
        }
      }
      else { 
        if (successor_state_factors['is_goal']) {
          return 0.3;
        }
        if ((state_factors['position'] == successor_state_factors['position']) &&
            (state_factors['num_mergers_remaining'] == successor_state_factors['num_mergers_remaining']) &&
            (state_factors['num_mergees_remaining'] == successor_state_factors['num_mergees_remaining'] + 1) &&
            (!successor_state_factors['is_moving'])) {
          return 0.7;
        }
      }
    }
    return 0.0;
  }

  rewardFunction(state, _) {
    if (state == this._size-1) {
      return 0.0;
    }
    else {
      return -1.0;
    }
  }

  startStates() {
    // can't start at the goal, or in a state where the position is larger than the lane
    let valid_start_states = [];
    const potential_states = [...Array(this._size-1).keys()];
    for (const state of potential_states) {
      const state_factors = this.getStateFactorsFromState(state);
      if (state_factors['lane_id'] == 'MERGER') {
        if (state_factors['position'] <= state_factors['num_mergers_remaining']) {
          valid_start_states.push(state);
        }
      }
      else {
        if (state_factors['position'] <= state_factors['num_mergees_remaining']) {
          valid_start_states.push(state);
        }
      }
    }
    return valid_start_states;
  }
}

module.exports = LaneMergingAgent;
