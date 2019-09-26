const Mdp = require('./mdp.js')
const SimpleSimplex = require('simple-simplex');

const size = 2;
const states = Array.from(Array(size).keys());
const actions = ['STOP', 'GO'];
const actionMap = {'STOP': 0, 'GO': 1}
const transitionFunction = function(state, action, successorState) {
    if (action == 'STOP') {
        if (state == successorState) {
            return 1;
        }
        return 0;
    } 

    if (action == 'GO') {
        if (state == size - 1 && state == successorState) {
            return 1
        }
        if (state == successorState - 1) {
            return 1;
        }
        return 0;
    }
};
const rewardFunction = function(state, action) {
    if (action == 'STOP') {
        if (state == size - 1) {
            return 1;    
        }
        return -1;
    }

    if (action == 'GO') {
        return -1;    
    }
};
const startState = 0;
const mdp = new Mdp(states, actions, transitionFunction, rewardFunction, startState);

function getVariable(state, action) {
    return state + ':' + action;
}

function getNamedVector(mdp) {
    var namedVector = {};

    for (const state of mdp.states) {
        for (const action of mdp.actions) {
            const variable = getVariable(state, action);
            namedVector[variable] = 0;
        }
    }

    return namedVector;
}

function createObjective(mdp) {
    var objective = {};

    for (const state of mdp.states) {
        for (const action of mdp.actions) {
            const variable = getVariable(state, action);
            objective[variable] = mdp.rewardFunction(state, action);
        }   
    }

    return objective;
}

function createConstraints(mdp) {
    var constraints = [];

    for (const successorState of mdp.states) {
        var namedVector = getNamedVector(mdp);

        for (const state of mdp.states) {
            for (const action of mdp.actions) {
                const variable = getVariable(state, action);
                const adjustment = mdp.startState == successorState ? -1 : 1;
                if (state == successorState) {
                    namedVector[variable] = adjustment * (mdp.transitionFunction(state, action, successorState) - 1);
                } else {
                    namedVector[variable] = adjustment * (mdp.transitionFunction(state, action, successorState));
                }

                if (namedVector[variable] == -0) {
                    namedVector[variable] = 0;
                }
            }
        }        

        constant = mdp.startState == successorState ? 1 : 0;

        constraints.push({
            namedVector: namedVector,
            constraint: '>=',
            constant: constant,
            description: 'Consistency constraint for state ' + successorState
        });
        // constraints.push({
        //     namedVector: namedVector,
        //     constraint: '<=',
        //     constant: constant
        // });
    }

    for (const state of mdp.states) {
        for (const action of mdp.actions) {
            const variable = getVariable(state, action);
            var namedVector = getNamedVector(mdp);
            namedVector[variable] = 1;
            constraints.push({
                namedVector: namedVector,
                constraint: '>=',
                constant: 0,
                description: 'Nonnegativity Constraint for state ' + state
            });
        }
    }

    return constraints;
}

objective = createObjective(mdp);
console.log(objective);

constraints = createConstraints(mdp);
console.log(constraints);
 
const solver = new SimpleSimplex({
  objective: objective,
  constraints: constraints,
  optimizationType: 'max'
});

const result = solver.solve({
  methodName: 'simplex',
});

console.log({
  solution: result.solution,
  isOptimal: result.details.isOptimal
});
