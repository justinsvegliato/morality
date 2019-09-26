'use strict';

const analyzer = require('./analyzer.js');
const morality = require('./morality.js');

const mdp = analyzer.getTestMdp(3);
const policy = morality.solve(mdp, null, null);

console.log(policy);
