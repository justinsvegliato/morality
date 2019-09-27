'use strict';

const fs = require('fs');

function getJson(filename) {
  return JSON.parse(fs.readFileSync(filename));
}

module.exports = {
  getJson,
};
