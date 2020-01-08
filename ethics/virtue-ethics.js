'use strict';

class VirtueEthics {
  constructor(moralTrajectories) {
    this._moralTrajectories = moralTrajectories;
  }

  get moralTrajectories() {
    return this._moralTrajectories;
  }

  transform(agent, program) {
    for (const state of agent.states()) {
      for (const action of agent.actions()) {
        program.constraints[`virtueEthics${state}${action}`] = {'max': 0};
      }

      const morallyPermittedActions = [];

      // Look for any moral examples that correspond to this state
      for (const moralTrajectory of this._moralTrajectories) {
        for (const [moralStateIndex, moralState] of moralTrajectory[0].entries()) {
          // Add to the morally permitted actions for this state if there is a matching moral example
          if (moralState == state) {
            const exemplarAction = moralTrajectory[1][moralStateIndex];
            morallyPermittedActions.push(exemplarAction);
          }
        }
      }

      // Add constraints if there are any moral examples for this state
      if (Object.keys(morallyPermittedActions).length > 0) {
        // Add a positive coefficient to actions that were not preferred by any moral exemplars
        for (const action of agent.actions()) {
          if (!morallyPermittedActions.includes(action)) {
            program.variables[`state${state}${action}`][`virtueEthics${state}${action}`] = 1;
          }
        }
      }
    }
  }
}

module.exports = VirtueEthics;
