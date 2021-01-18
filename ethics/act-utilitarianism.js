'use strict';


// TODO: define establishEffects and memberStatePrior either here or in example / experiment. Preferably not here.
class ActUtilitarianism {
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
        program.constraints[`actUtilitarianism${state}${action}`] = {'max': 0};
      }
      let action_values = {};
      for (const action of agent.actions()) {
        let total_value = 0;
        for (const member of this._moral_community) {

          let member_expected_value = 0.0;
          for (const member_state of member.states()) {
            const prior = memberStatePrior(state, member_state);
            if (prior == 0) {
              continue;
            } 
            for (const succ_state of agent.states()) {
              const trans_prob = agent.transitionFunction(state, action, succ_state);
              if (trans_prob == 0) {
                continue;
              } 
              for (const succ_member_state of member_states) {
                const effect_probability = establishEffects(state, succ_state, member_state, succ_member_state);
                member_expected_value += prior * trans_prob * effect_probability * member.value(succ_member_state);
              }
            }
          }
          total_value += member_expected_value;
        }
        action_values[action] = total_value;
      }

      // Get the argmax of possible actions
      // TODO: allow use of optimific approximation factor
      const morally_permitted_actions = Object.keys(action_values).filter(x => {
          return action_values[x] == Math.max.apply(null, Object.values(action_values));
      });

      // Add a positive coefficient to actions that were not permitted
      for (const action of agent.actions()) {
        if (!morally_permitted_actions.includes(action)) {
          program.variables[`state${state}${action}`][`actUtilitarianism${state}${action}`] = 1;
        }
      }
    }
  }
}

module.exports = ActUtilitarianism;

