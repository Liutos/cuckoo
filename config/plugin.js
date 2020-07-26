'use strict';

const path = require('path');

// had enabled by egg
// exports.static = true;
exports.nunjucks = {
  enable: true,
  package: 'egg-view-nunjucks',
};

exports.sqlite = {
  enable: true,
  path: path.join(__dirname, '../lib/plugin/egg-sqlite'),
};

exports.validate = {
  enable: true,
  package: 'egg-validate',
};
