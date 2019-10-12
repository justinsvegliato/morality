'use strict';


class MoralExemplarEthics {
  constructor(exemplarTrajectories) {
    this._exemplarTrajectories = exemplarTrajectories;
  }

  get exemplarTrajectories() {
    return this._exemplarTrajectories;
  }

  transform(agent, program) {
    
//I'm sorry this is so incomplete :( ... I traveled to LA this weekend.

    program.constraints[`MoralExemplarEthics${state}${action}`] = {'max': 0};

    // For every state
    for (const state of agent.states()) {
        
      // Look for a corresponding moral example state
      for (const trajectory of this._exemplarTrajectories) {
        
        //let is_morally_justified = false;
        for (const exemplarState of trajectory.states()) {
     
          for (const action of agent.actions()) { // May in general depend on state
            if (action == moralexemplar action) {
              
            }
          }
        }
        if (is_morally_justified) {
          //add constraint
        }
      }
    }
  }
}
