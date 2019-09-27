'use strict';

const analyzer = require('./analyzer.js');
const morality = require('./morality.js');

const mdp = analyzer.getLineMdp(3);

console.log('Primal Policy:');
const primalPolicy = morality.solve(mdp, null, null, true);
console.log(primalPolicy);

console.log('Dual Policy:');
const dualPolicy = morality.solve(mdp, null, null, false);
console.log(dualPolicy);
