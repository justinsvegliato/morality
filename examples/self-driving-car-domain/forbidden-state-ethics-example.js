'use strict';

const morality = require('../../morality.js');
const SelfDrivingCarAgent = require('../../agents/self-driving-car-agent.js');
const ForbiddenStateEthics = require('../../ethics/forbidden-state-ethics.js');

const agent = new SelfDrivingCarAgent({
  locations: ['LIBRARY', 'GROCERY_STORE', 'COFFEE_SHOP', 'HIGH_SCHOOL', 'PIZZA_PLACE', 'HOME', 'TRAIN_STATION', 'UNIVERSITY'],
  roads: {
    MATOON_STREET_EAST: {fromLocation: 'HIGH_SCHOOL', toLocation: 'HOME', length: 5, type: 'CITY'},
    MATOON_STREET_WEST: {fromLocation: 'HOME', toLocation: 'HIGH_SCHOOL', length: 5, type: 'CITY'},
    GRAY_STREET_NORTH: {fromLocation: 'TRAIN_STATION', toLocation: 'HOME', length: 5, type: 'CITY'},
    GRAY_STREET_SOUTH: {fromLocation: 'HOME', toLocation: 'TRAIN_STATION', length: 5, type: 'CITY'},
    MAIN_STREET_EAST: {fromLocation: 'LIBRARY', toLocation: 'TRAIN_STATION', length: 20, type: 'CITY'},
    MAIN_STREET_WEST: {fromLocation: 'TRAIN_STATION', toLocation: 'LIBRARY', length: 20, type: 'CITY'},
    ROUTE9_EAST: {fromLocation: 'GROCERY_STORE', toLocation: 'LIBRARY', length: 40, type: 'COUNTY'},
    ROUTE9_WEST: {fromLocation: 'LIBRARY', toLocation: 'GROCERY_STORE', length: 40, type: 'COUNTY'},
    ROUTE116_NORTH: {fromLocation: 'GROCERY_STORE', toLocation: 'UNIVERSITY', length: 60, type: 'FREEWAY'},
    ROUTE116_SOUTH: {fromLocation: 'UNIVERSITY', toLocation: 'GROCERY_STORE', length: 60, type: 'FREEWAY'},
    NORTH_PLEASANT_STREET_NORTH: {fromLocation: 'PIZZA_PLACE', toLocation: 'UNIVERSITY', length: 10, type: 'CITY'},
    NORTH_PLEASANT_STREET_SOUTH: {fromLocation: 'UNIVERSITY', toLocation: 'PIZZA_PLACE', length: 10, type: 'CITY'},
    EAST_PLEASANT_STREET_EAST: {fromLocation: 'COFFEE_SHOP', toLocation: 'PIZZA_PLACE', length: 5, type: 'CITY'},
    EAST_PLEASANT_STREET_WEST: {fromLocation: 'PIZZA_PLACE', toLocation: 'COFFEE_SHOP', length: 5, type: 'CITY'},
    TRIANGLE_STREET_NORTH: {fromLocation: 'HIGH_SCHOOL', toLocation: 'COFFEE_SHOP', length: 5, type: 'CITY'},
    TRIANGLE_STREET_SOUTH: {fromLocation: 'COFFEE_SHOP', toLocation: 'HIGH_SCHOOL', length: 5, type: 'CITY'},
    COLLEGE_STREET_NORTH: {fromLocation: 'COFFEE_SHOP', toLocation: 'LIBRARY', length: 15, type: 'CITY'},
    COLLEGE_STREET_SOUTH: {fromLocation: 'LIBRARY', toLocation: 'COFFEE_SHOP', length: 15, type: 'CITY'}
  },
  startLocations: ['UNIVERSITY'],
  goalLocation: 'HOME'
});

const forbiddenStates = agent.states().filter((state) => {
  const information = agent.interpret(state);
  const isSpeeding = information.speed == 'HIGH';
  const isUncareful = information.speed == 'NORMAL' && information.condition == 'BUSY';
  return isSpeeding || isUncareful;
});
const ethics = new ForbiddenStateEthics(forbiddenStates);

console.log('Amoral Policy');
const amoralSolution = morality.solve(agent);
if (amoralSolution) {
  console.log(amoralSolution.policy);
}

console.log('Moral Policy');
const moralSolution = morality.solve(agent, ethics);
if (moralSolution) {
  console.log(moralSolution.policy);
}
