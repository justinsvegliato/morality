'use strict';

class TheGoldenRule {
  constructor(moralCommunity, tolerance) {
    this._moralCommunity = moralCommunity;
    this._tolerance = tolerance;
  }

  get moralCommunity() {
    return this._moralCommunity;
  }

  establishEFFects() {
    // TODO: construct function F from moral community representation
    f = []
    this._f = f;
  }

  transform(agent, program) {

    establishEFFects();

    for (const state of agent.states()) {
      for (const action of agent.actions()) {
        program.constraints[`theGoldenRule${state}${action}`] = {'max': 0};
      }

      const morallyPermittedActions = [];

      for (const action of agent.actions()) {
        satisfies_golden_rule_for_all = true;
        for (const member in this._moralCommunity) {








          // TODO: based on F, identify permitted or prohibitted actions
          member_current_value = 0 // TODO: probably sum over S P(s=s) * V(s)
          member_new_value = 0.0; 
          for (member_state in member.states()) {
            member_new_value += sum T() * sum F() * V()
          }







          delta_value = member_current_value - member_new_value
          if (delta_value > this._tolerance) {
            satisfies_golden_rule_for_all = false;
            break;
          }
        }

        // Add to the morally permitted actions for this state is all 
        if (statisfies_golden_rule_for_all) {
          morallyPermittedActions.push(action);
        }

        // Add constraints if there are any moral examples for this state
        if (Object.keys(morallyPermittedActions).length > 0) {
          // Add a positive coefficient to actions that were not preferred by any moral exemplars
          for (const action of agent.actions()) {
            if (!morallyPermittedActions.includes(action)) {
              program.variables[`state${state}${action}`][`theGoldenRule${state}${action}`] = 1;
            }
          }
        }
      }
    }
  }
}

module.exports = TheGoldenRule;

