'use strict';

const ACTION_DETAILS = {
  'ALLOW': {},
  'CONTINUE': {},
  'WAIT': {}
};

class LaneMergingAgent {
  constructor(num_mergers, num_mergees) {
    // The +1 are because lanes may be empty
    this._num_merging_states = num_mergers + 1;
    this._num_mergee_states = num_mergees + 1;
    this._num_lanes = 2;
    // min so that we have no "open" spots on the road
    // The -1 is because unlike merging states, we cannot have a position of '0'
    this._num_positions = Math.min(this._num_merging_states, this._num_mergee_states) - 1;
    // The 2 is because the agent could be in either lane
    // The other 2 is because the agent's lane could be moving, or not 
    // +1 for the goal state
    this._size = (this._num_merging_states) * (this._num_mergee_states) * 2 * 2 * this._num_positions + 1;
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
      state = state % ((this._size-1) / 4);
      state_factors['position'] = Math.floor(state / (this._num_merging_states * this._num_mergee_states)) + 1;
      state = state % (this._num_merging_states * this._num_mergee_states);
      state_factors['num_mergers_remaining'] = Math.floor(state / this._num_merging_states);
      state_factors['num_mergees_remaining'] = state % this._num_merging_states;
    }

    return state_factors;
  }

  transitionFunction(state, action, successorState) {
    const state_factors = this.getStateFactorsFromState(state);
    const successor_state_factors = this.getStateFactorsFromState(successorState);
  
    //console.log(state_factors['position']);
    //console.log(state_factors['num_mergers_remaining']);
    //console.log(state_factors['num_mergees_remaining']);
 
    // self loop illegal states forever. obvi not the best way to do it... but its much easier index math this way
    if (state_factors['lane_id'] == 'MERGER' && (state_factors['position'] > state_factors['num_mergers_remaining'])) {
      if (state == successorState) {
        return 1.0;
      }
      else {
        return 0.0;
      }
    }
    if (state_factors['lane_id'] == 'MERGEE' && (state_factors['position'] > state_factors['num_mergees_remaining'])) {
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
    
    // can't reach the goal from more than one place away
    if ((state_factors['position'] != 1) && successor_state_factors['is_goal']) {
      return 0.0;
    }
    
    // can't switch lanes   
    if ((state_factors['lane_id'] != successor_state_factors['lane_id']) &&
        (successor_state_factors['is_goal'] != true)) {
      return 0.0;
    }

    // can't go backwards
    if ((successor_state_factors['position'] > state_factors['position']) &&
        (successor_state_factors['is_goal'] != true)) {
      return 0.0;
    }

    // can't skip ahead more than one car at a time
    if ((state_factors['position'] - successor_state_factors['position'] > 1) &&
        (successor_state_factors['is_goal'] != true)) {
      return 0.0;
    }

    // can't have more than one car merge each time step
    if ((state_factors['num_mergees_remaining'] > successor_state_factors['num_mergees_remaining'] + 1) &&
        (successor_state_factors['is_goal'] != true)) {
      return 0.0;
    } 
    if ((state_factors['num_mergers_remaining'] > successor_state_factors['num_mergers_remaining'] + 1) &&
        (successor_state_factors['is_goal'] != true)) {
      return 0.0;
    } 
    
    // can't add new cars
    if ((state_factors['num_mergees_remaining'] < successor_state_factors['num_mergees_remaining']) &&
        (successor_state_factors['is_goal'] != true)) {
      return 0.0;
    } 
    if ((state_factors['num_mergers_remaining'] < successor_state_factors['num_mergers_remaining']) &&
        (successor_state_factors['is_goal'] != true)) {
      return 0.0;
    } 

    // TODO: need an awkwardness dynamic so that for efficiency's sake, one lane is preferred over another at a time

    // Waiting dynamics
    if (state_factors['position'] != 1) {

      // if merger lane is empty, traffic flow is smooth
      if (state_factors['num_mergers_remaining'] == 0) {
        if ((successor_state_factors['num_mergees_remaining'] == state_factors['num_mergees_remaining'] - 1) &&
            (successor_state_factors['position'] == state_factors['position'] - 1) && 
            (state_factors['lane_id'] == 'MERGEE') && successor_state_factors['is_moving']) {
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
            (state_factors['lane_id'] == 'MERGER') && successor_state_factors['is_moving']) {
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

    // NOTE: the only cases to get here should have position = 1
    
    // if road is empty, go directly to the goal
    if ((state_factors['num_mergers_remaining'] == 0 && state_factors['lane_id'] == 'MERGEE') || 
        (state_factors['num_mergees_remaining'] == 0 && state_factors['lane_id'] == 'MERGER')) {
      if ((state_factors['position'] == 1) && successor_state_factors['is_goal'] == true) {
        return 1.0;
      }
      else {
        return 0.0;
      }
    }
   
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
            (successor_state_factors['position'] == 1)) {
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
