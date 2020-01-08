'use strict';

const morality = require('../../morality.js');
const GridWorldAgent = require('../../agents/grid-world-agent.js');
const PrimaFacieDuties = require('../../ethics/prima-facie-duties.js');
const printer = require('../../utils/printer.js');

const gridWorld = [
  ['O', 'O', 'W', 'W', 'O', 'O', 'O', 'W', 'O', 'O', 'O', 'O'],
  ['O', 'O', 'W', 'W', 'O', 'W', 'O', 'W', 'O', 'W', 'O', 'O'],
  ['O', 'O', 'W', 'W', 'O', 'W', 'O', 'O', 'O', 'W', 'O', 'O'],
  ['O', 'O', 'O', 'O', 'O', 'W', 'W', 'W', 'W', 'W', 'O', 'O'],
  ['O', 'O', 'W', 'W', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O'],
  ['O', 'O', 'O', 'O', 'O', 'W', 'W', 'W', 'W', 'W', 'G', 'O']
];
const agent = new GridWorldAgent(gridWorld);

const duties = ['Quiet Operation', 'Personal Space'];
const violationFunction = (state) => {
  if (state == 55) {
    return ['Quiet Operation', 'Personal Space'];
  }
  return [];
};
const penaltyFunction = (duty, state) => {
  if (duty == 'Quiet Operation') {
    return 1;
  }
  if (duty == 'Personal Space') {
    return 10;
  }
  return 0;
};
const tolerance = 0.1;
const ethics = new PrimaFacieDuties(duties, violationFunction, penaltyFunction, tolerance);

console.log('Domain');
printer.printGridWorldDomain(gridWorld, ethics);

console.log('Amoral Policy');
const amoralSolution = morality.solve(agent);
if (amoralSolution) {
  printer.printGridWorldPolicy(gridWorld, amoralSolution.policy);
}

console.log('Moral Policy');
const moralSolution = morality.solve(agent, ethics);
if (moralSolution) {
  printer.printGridWorldPolicy(gridWorld, moralSolution.policy);
}
