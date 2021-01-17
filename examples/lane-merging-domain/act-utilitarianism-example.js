'use strict';

const morality = require('../../morality.js');
const LaneMergingAgent = require('../../agents/lane-merging-agent.js');
const ActUtilitarianism = require('../../ethics/act-utilitarianism.js');s
const printer = require('../../utils/printer.js');

const num_mergers = 2;
const num_mergees = 2;
const agent = new LaneMergingAgent(5, 5);

printer.printTransitionFunction(agent)

console.log('Amoral Policy');
const amoralSolution = morality.solve(agent);
if (amoralSolution) {
  print(amoralSolution.policy);
}

const moralCommunity = [];
for (let i = 0; i < num_mergers + num_mergees; i++) {
  moralCommunity.push({states: agent.states, values: amoralSolution.values});
}

//TODO: define p()
//TODO: define f()

const optimific_approximation_factor = 5;
const ethics = new ActUtilitarianism(moralCommunity, , , optimific_approximation_factor);

console.log('Moral Policy');
const moralSolution = morality.solve(agent, ethics);
if (moralSolution) {
  print(moralSolution.policy);
}
