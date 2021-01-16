'use strict';

class TheGoldenRule {
  constructor(moral_community, establishEffects, memberStatePrior, tolerance) {
    this._moral_community = moral_community;
    this._tolerance = tolerance;
  }

  getMoralCommunity() {
    return this._moral_community;
  }

  transform(agent, program) {
    for (const state of agent.states()) {
      // NOTE: this might not be necessary... I forget exactly what this does...
      for (const action of agent.actions()) {
        program.constraints[`theGoldenRule${state}${action}`] = {'max': 0};
      }
      const morally_permitted_actions = {};
      for (const action of agent.actions()) {
        satisfies_golden_rule_for_all = true;
        for (const member in this._moral_community) {
          member_current_expected_value = 0.0;
          member_new_expected_value = 0.0;
          for (const member_state of member.states()) {
            prior = memberStatePrior(state);
            member_current_expected_value += prior * member.value(state);
            for (const succ_state of agent.states()) {
              trans_prob = agent.transitionFunction(state, action, succ_state);
              for (const succ_member_state of member_states) {
                effect_probability = establishEffects(state, succ_state, member_state, succ_member_state);
                member_new_expected_value += prior * trans_prob * effect_probability * member.value(succ_member_state);
              }
            }
          }

          delta_value = member_current_expected_value - member_new_expected_value;
          if (delta_value > this._tolerance) {
            satisfies_golden_rule_for_all = false;
            break;
          }
        }

        // Add to the morally permitted actions for this state
        if (statisfies_golden_rule_for_all) {
          morally_permitted_actions.push(action);
        }


        // Add a positive coefficient to actions that were not permitted
        for (const action of agent.actions()) {
          if (!morally_permitted_actions.includes(action)) {
            program.variables[`state${state}${action}`][`theGoldenRule${state}${action}`] = 1;
          }
        }
      }
    }
  }
}

module.exports = TheGoldenRule;

