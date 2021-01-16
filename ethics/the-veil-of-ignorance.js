'use strict';

class TheVeilOfIgnorance {
  constructor(moralCommunity, computeVeilEquivalentStates, tolerance) {
    this._moral_community = moral_community;
    this._tolerance = tolerance;
  }

  getMoralCommunity() {
    return this._moral_community;
  }

  // TODO: define computeVeilEquivalentStates either here or in example / experiment. Preferably not here.
  transform(agent, program) {
    for (const state of agent.states()) {
      for (const member of this._moralCommunity) {
        veil_equivalent_states = computeVeilEquivalentStates(state, member);
        for (veiled_member_state of veil_equivalent_states) {
          member_value = member.value(veiled_member_state);
          //TODO: add constraint about policies value and value at this state (already given)
          //program.constraints[`actUtilitarianism${state}${action}`] = {'max': 0};
          //program.variables[`state${state}${action}`][`actUtilitarianism${state}${action}`] = 1;
        }
      }
    }
  }
}

module.exports = TheVeilOfIgnorance;

