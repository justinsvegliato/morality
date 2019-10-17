'use strict';

class MoralExemplarEthics {
  constructor(exemplarTrajectories) {
    this._exemplarTrajectories = exemplarTrajectories;
  }

  get exemplarTrajectories() {
    return this._exemplarTrajectories;
  }

  transform(agent, program) {
    for (const state of agent.states()) {
      for (const action of agent.actions()) { // TODO May in general depend on state
        program.constraints[`moralExemplarEthics${state}${action}`] = {'max': 0};
      }

      const morallyPermittedActions = [];

      // Look for any moral examples that correspond to this state
      for (const exemplarTrajectory of this._exemplarTrajectories) {
        for (const [exemplarStateIndex, exemplarState] of exemplarTrajectory[0].entries()) {
          // Add to the morally permitted actions for this state if there is a matching moral example
          if (exemplarState == state) {
            const exemplarAction = exemplarTrajectory[1][exemplarStateIndex];
            morallyPermittedActions.push(exemplarAction);
          }
        }
      }

      // Add constraints if there are any moral examples for this state
      if (Object.keys(morallyPermittedActions).length > 0) {
        // Add a positive coefficient to actions that were not preferred by any moral exemplars
        for (const action of agent.actions()) { // TODO May in general depend on state
          if (!morallyPermittedActions.includes(action)) {
            program.variables[`state${state}${action}`][`moralExemplarEthics${state}${action}`] = 1;
          }
        }
      }
    }
  }
}

module.exports = MoralExemplarEthics;
