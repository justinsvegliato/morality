'use strict';

const ACTION_DETAILS = {
  'ALLOW': {},
  'CONTINUE': {},
  'WAIT': {}
};

class LaneMergingAgent {
  constructor(lane_merging_world) {
    this._lane_merging_world = lane_merging_world;
    this._num_merging_members = lane_merging_world.num_mergers;
    this._num_mergee_members = lane_merging_world.num_mergees;
    this._num_lanes = 2;
    // min so that we have no "open" spots on the road
    this._num_positions = Math.min(this._mergers, this._mergees);
    // The 2 is because the agent could be in either lane
    // The other 2 is because the agent's lane could be moving, or not 
    // +1 for the goal state
    this._size = this._mergers * this._mergees * 2 * 2 * this._positions + 1;
  }

  states() {
    return [...Array(this._size).keys()];
  }

  actions() {
    return Object.keys(ACTION_DETAILS);
  }

  getStateFactorsFromState(state) {
    state_factors = {}
    if (state == this._size-1) {
      state_factors['is_goal'] = true;
      state_factors['lane_id'] = 'NONE';
      state_factors['is_moving'] = 'NONE';
      state_factors['position'] = 'NONE';
      state_factors['num_mergers_remaining'] = 0;
      state_factors['num_mergees_remaining'] = 0;
    else {
      state_factors['is_goal'] = false;
      state_factors['lane_id'] = 'MERGER';
      if (state < ((this._size-1) / 2)) {
        state_factors['lane_id'] = 'MERGEE';
      }
      state = state % (this._size-1) / 2);
      state_factors['is_moving'] = false;
      if (state < (this._size-1) / 4)) {
        state_factors['is_moving'] = true;
      }
      state = state % (state / 2);
      state_factors['position'] = Math.floor(state / (this._num_merging_members * this._num_mergee_members));
      state = state % (this._num_merging_members * this._num_mergee_members);
      state_factors['num_mergers_remaining'] = Math.floor(state / this._num_merging_members);
      state_factors['num_mergees_remaining'] = state % this._num_merging_members;

    return state_factors;
  }

  // TODO: double check everything
  transitionFunction(state, action, successorState) {

    state_factors = getStateFactorsFromState(state);
    successor_state_factors = getStateFactorsFromState(successorState);
   
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
    if (state_factors['is_goal'] && succesor_state_factors['is_goal']) {
      return 1.0;
    }
    if (state_factors['is_goal'] && !succesor_state_factors['is_goal']) {
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



    //TODO: determine criteria for getting to the goal
    if (successor_is_goal) {
      return 1.0;
    }


    //TODO: if merger lane is empty
    //TODO: if mergee lane is empty


    // what are the dynamics for when each action is chosen? where is the stochasticity? other agents choices?
    if (lane_id == 'MERGER') {
      if (lane_status_partition == 1) { // currently moving
        
      }
      else if (lane_status_partition == 0) { // currently not moving
        
      }
    }

    else {
      if (lane_status_partition == 1) { // currently moving
        
      }
      else if (lane_status_partition == 0) { // currently not moving
        
      }

    }

  }

  rewardFunction(state, action) {
    if (state == this._size-1) {
      return 0.0;
    }
    else {
      return -1.0;
    }
  }

  startStates() {
    // can't start at the goal

    //TODO: can't start in a position / lane combo that is larger than that lane's num members
    //TODO: double check that I prune all states where position / lane combo is greater than respective lane members
    return [...Array(this._size-1).keys()];
  }
}

module.exports = GridWorldAgent;
