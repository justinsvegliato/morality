'use strict';

const morality = require('../../morality.js');
const LaneMergingAgent = require('../../agents/lane-merging-agent.js');
const TheVeilOfIgnorance = require('../../ethics/the-veil-of-ignorance.js');
const printer = require('../../utils/printer.js');

const num_mergers = 2;
const num_mergees = 2;
const agent = new LaneMergingAgent(num_mergers, num_mergees);

console.log('Amoral Policy');
const amoralSolution = morality.solve(agent);
if (amoralSolution) {
  console.log(amoralSolution.policy);
}

const moralCommunity = [];
for (let i = 0; i < num_mergers + num_mergees; i++) {
  moralCommunity.push({states: agent.states, values: amoralSolution.values});
}

const veiledStateFactors = ['lane_id'];
const inequityTolerance = 2;

const ethics = new TheVeilOfIgnorance(moralCommunity, veiledStateFactors, inequityTolerance);

console.log('Moral Policy');
const moralSolution = morality.solve(agent, ethics, true);
if (moralSolution) {
  console.log(moralSolution.policy);
}
