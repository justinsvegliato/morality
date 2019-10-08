'use strict';

class ForbiddenStateEthics {
  constructor(forbiddenStates) {
    this._forbiddenStates = forbiddenStates;
  }

  get forbiddenStates() {
    return this._forbiddenStates;
  }

  transform(agent, program) {
    for (const constraintState of this._forbiddenStates) {
      for (const constraintAction of agent.actions()) {
        program.constraints[`forbiddenStateEthics${constraintState}${constraintAction}`] = {'max': 0};
      }
    }

    for (const variableState of agent.states()) {
      for (const variableAction of agent.actions()) {
        for (const constraintState of this._forbiddenStates) {
          for (const constraintAction of agent.actions()) {
            const isActive = variableState == constraintState && variableAction == constraintAction ? 1 : 0;
            program.variables[`state${variableState}${variableAction}`][`forbiddenStateEthics${constraintState}${constraintAction}`] = isActive;
          }
        }
      }
    }
  }
}

module.exports = ForbiddenStateEthics;

