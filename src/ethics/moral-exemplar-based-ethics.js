'use strict';


class MoralExemplarEthics {
  constructor(exemplarTrajectories) {
    this._exemplarTrajectories = exemplarTrajectories;
  }

  get exemplarTrajectories() {
    return this._exemplarTrajectories;
  }

  transform(agent, program) {
    

    // For every state
    for (const state of agent.states()) {
     
      // Add constraints to state action space
      for (const action of agent.actions()) { // May in general depend on state... TODO
        program.constraints[`moralExemplarEthics${state}${action}`] = {'max': 0};
      }

      let morally_permitted_actions = {}

      // Look for a corresponding moral example state
      for (const trajectory of this._exemplarTrajectories) {
        let trajectory_index = 0;
        for (const exemplarState of trajectory[0]) {
    
          // Add to permitted actions for this state 
          if (exemplarState == state) {
            let exemplarAction = trajectory[1][trajectory_index];
            morally_permitted_actions[`MoralExemplarEthics${state}${exemplarAction}`] = true;
          }
          trajectory_index = trajectory_index + 1;
        }
      }
    
      // If we have any moral examples
      if (Object.keys(morally_permitted_actions).length > 0) {

        // Add non-zero coefficients to states where other actions were preferred by exemplars
        for (const action of agent.actions()) { // May in general depend on state... TODO
          if (morally_permitted_actions[`MoralExemplarEthics${state}${action}`] != true) {
            program.variables[`state${state}${action}`][`moralExemplarEthics${state}${action}`] = 1.0;
          }
          else { // TODO: Is this necessary?
            program.variables[`state${state}${action}`][`moralExemplarEthics${state}${action}`] = 0.0;
          }
        }
      }
      else { // Set zero coefficients for all states with no moral examples
        for (const action of agent.actions()) { // May in general depend on state... TODO
          program.variables[`state${state}${action}`][`moralExemplarEthics${state}${action}`] = 0.0;
        }
      }
    }
  }
}

module.exports = MoralExemplarEthics;

