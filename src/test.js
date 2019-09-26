'use strict';

const analyzer = require('./analyzer.js');
const morality = require('./morality.js');
const ForbiddenStateEthicalContext = require('./forbidden-state-ethical-context.js');

const mdp = analyzer.getLineMdp(3);
const ethicalContext = new ForbiddenStateEthicalContext([1], null);

console.log('Primal Policy:');
const primalPolicy = morality.solve(mdp, ethicalContext, null, true);
console.log(primalPolicy);

console.log('Dual Policy:');
const dualPolicy = morality.solve(mdp, ethicalContext, null, false);
console.log(dualPolicy);
