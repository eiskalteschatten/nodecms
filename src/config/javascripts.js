'use strict';

const path = require('path');

// The order is critical!

const libs = [
  '../../node_modules/jquery/dist/jquery.min.js',
  //'../../node_modules/nunjucks/browser/nunjucks.min.js',
  '../../node_modules/uikit/dist/js/uikit.min.js'
];

const scripts = [
];

module.exports = {
  libs: libs.map(file => {
    return path.join(__dirname, file);
  }),
  scripts: scripts.map(file => {
    return path.join(__dirname, file);
  })
};
