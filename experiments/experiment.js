'use strict';

const morality = require('../morality.js');
const SelfDrivingCarAgent = require('../agents/self-driving-car-agent.js');
const ForbiddenStateEthics = require('../ethics/forbidden-state-ethics.js');
const NormBasedEthics = require('../ethics/norm-based-ethics.js');

const agent = new SelfDrivingCarAgent({
  'locations': [
    'HOME',
    'HIGH_SCHOOL',
    'TRAIN_STATION',
    'COFFEE_SHOP',
    'PIZZA_PLACE',
    'GROCERY_STORE',
    'GAS_STATION',
    'OFFICE',
    'UNIVERSITY',
    'TOWN_HALL',
    'HOSPITAL',
    'RESTAURANT',
    'POST_OFFICE',
    'PARK',
    'DELI'
  ],
  'roads': {
    'MATOON_STREET': {
      'fromLocation': 'HIGH_SCHOOL',
      'toLocation': 'HOME',
      'type': 'CITY',
      'length': 1
    },
    'GRAY_STREET': {
      'fromLocation': 'HOME',
      'toLocation': 'TRAIN_STATION',
      'type': 'CITY',
      'length': 3
    },
    'ASTOR_DRIVE': {
      'fromLocation': 'HIGH_SCHOOL',
      'toLocation': 'COFFEE_SHOP',
      'type': 'CITY',
      'length': 2
    },
    'MAIN_STREET': {
      'fromLocation': 'COFFEE_SHOP',
      'toLocation': 'PIZZA_PLACE',
      'type': 'CITY',
      'length': 2
    },
    'PLEASANT_STREET': {
      'fromLocation': 'PIZZA_PLACE',
      'toLocation': 'GROCERY_STORE',
      'type': 'CITY',
      'length': 2
    },
    'MERRICK_ROAD': {
      'fromLocation': 'PIZZA_PLACE',
      'toLocation': 'TRAIN_STATION',
      'type': 'COUNTY',
      'length': 3
    },
    'TRIANGLE_STREET': {
      'fromLocation': 'HIGH_SCHOOL',
      'toLocation': 'TRAIN_STATION',
      'type': 'CITY',
      'length': 3
    },
    'SERVICE_ROAD': {
      'fromLocation': 'TRAIN_STATION',
      'toLocation': 'GAS_STATION',
      'type': 'COUNTY',
      'length': 2
    },
    'SUNRISE_HIGHWAY': {
      'fromLocation': 'GAS_STATION',
      'toLocation': 'OFFICE',
      'type': 'FREEWAY',
      'length': 5
    },
    'ASYLUM_ROAD': {
      'fromLocation': 'GROCERY_STORE',
      'toLocation': 'UNIVERSITY',
      'type': 'COUNTY',
      'length': 1
    },
    'COLLEGE_STREET': {
      'fromLocation': 'UNIVERSITY',
      'toLocation': 'GAS_STATION',
      'type': 'CITY',
      'length': 1
    },
    'STATE_STREET': {
      'fromLocation': 'GROCERY_STORE',
      'toLocation': 'TOWN_HALL',
      'type': 'CITY',
      'length': 2
    },
    'OAK_ROAD': {
      'fromLocation': 'TOWN_HALL',
      'toLocation': 'OFFICE',
      'type': 'COUNTY',
      'length': 3
    },
    'CUT_STREET': {
      'fromLocation': 'PIZZA_PLACE',
      'toLocation': 'UNIVERSITY',
      'type': 'CITY',
      'length': 2
    },
    'TAYLOR_STREET': {
      'fromLocation': 'TOWN_HALL',
      'toLocation': 'HOSPITAL',
      'type': 'CITY',
      'length': 1
    },
    'LINCOLN_AVENUE': {
      'fromLocation': 'UNIVERSITY',
      'toLocation': 'HOSPITAL',
      'type': 'CITY',
      'length': 1
    },
    'ROUTE_9': {
      'fromLocation': 'OFFICE',
      'toLocation': 'RESTAURANT',
      'type': 'COUNTY',
      'length': 2
    },
    'ROUTE_116': {
      'fromLocation': 'GAS_STATION',
      'toLocation': 'POST_OFFICE',
      'type': 'COUNTY',
      'length': 3
    },
    'FOREST_STREET': {
      'fromLocation': 'POST_OFFICE',
      'toLocation': 'PARK',
      'type': 'CITY',
      'length': 2
    },
    'CHESNUT_STREET': {
      'fromLocation': 'DELI',
      'toLocation': 'POST_OFFICE',
      'type': 'CITY',
      'length': 1
    },
    'AMITY_STREET': {
      'fromLocation': 'DELI',
      'toLocation': 'RESTAURANT',
      'type': 'CITY',
      'length': 2
    }
  },
  'startLocations': [
    'HOME'
  ],
  'goalLocation': 'OFFICE'
});

const forbiddenStates = agent.states().filter((state) => {
  const information = agent.interpret(state);
  const isSpeeding = information.speed == 'HIGH';
  const isUncareful = information.speed == 'NORMAL' && information.condition == 'BUSY';
  return isSpeeding || isUncareful;
});

const norms = ['HESITANT_OPERATION', 'RECKLESS_OPERATION'];
const violationFunction = (state) => {
  const information = agent.interpret(state);
  if (information.speed == 'HIGH') {
    return ['RECKLESS_OPERATION'];
  }
  if (information.speed == 'NORMAL' && information.condition == 'BUSY') {
    return ['RECKLESS_OPERATION'];
  }
  if (information.speed == 'LOW' && information.condition == 'EMPTY') {
    return ['HESITANT_OPERATION'];
  }
  return [];
};
const penaltyFunction = (norm, state) => {
  const information = agent.interpret(state);
  if (norm == 'HESITANT_OPERATION') {
    return 1;
  }
  if (norm == 'RECKLESS_OPERATION') {
    if (information.speed == 'HIGH' && information.condition == 'BUSY') {
      return 30;
    }
    if (information.speed == 'HIGH' && information.condition == 'EMPTY') {
      return 7.5;
    }
    if (information.speed == 'NORMAL' && information.condition == 'BUSY') {
      return 15;
    }
  }
  return 0;
};
const tolerance = 5;

console.log('Amoral Policy');
const amoralSolution = morality.solve(agent, null, true);
if (amoralSolution) {
  console.log(JSON.stringify(amoralSolution.policy));
}

const forbiddenStateEthics = new ForbiddenStateEthics(forbiddenStates);

console.log('Forbidden State Ethics Moral Policy');
const forbiddenStateEthicsSolution = morality.solve(agent, forbiddenStateEthics, true);
if (forbiddenStateEthicsSolution) {
  console.log(JSON.stringify(forbiddenStateEthicsSolution.policy));
}

const normBasedEthics = new NormBasedEthics(norms, violationFunction, penaltyFunction, tolerance);

console.log('Norm-Based Ethics Moral Policy');
const normBasedEthicsSolution = morality.solve(agent, normBasedEthics, true);
if (normBasedEthicsSolution) {
  console.log(JSON.stringify(normBasedEthicsSolution.policy));
}

console.log(`Amoral Objective: ${Math.abs(amoralSolution.objective).toFixed(2)} seconds`);
console.log(`Forbidden State Ethics Objective: ${Math.abs(forbiddenStateEthicsSolution.objective).toFixed(2)} seconds`);
console.log(`Norm-Based Ethics Objective: ${Math.abs(normBasedEthicsSolution.objective).toFixed(2)} seconds`);
console.log(`Forbidden State Ethics Price of Morality: ${Math.abs(forbiddenStateEthicsSolution.objective - amoralSolution.objective).toFixed(2)} seconds`);
console.log(`Norm-Based Ethics Price of Morality: ${Math.abs(normBasedEthicsSolution.objective - amoralSolution.objective).toFixed(2)} seconds`);
