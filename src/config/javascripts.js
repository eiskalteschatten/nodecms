'use strict';

const path = require('path');

// The order is critical!

const libs = [
  '../../node_modules/jquery/dist/jquery.min.js',
  '../public/js/libs/fontawesome-all.js',
  '../../node_modules/nunjucks/browser/nunjucks.min.js',
  '../../node_modules/uikit/dist/js/uikit.min.js',
];

const scripts = [
  '../public/js/messages.js',
  '../public/js/loader.js',
  '../public/js/forms.js',
  '../public/js/mainNav.js',
  '../public/js/documentReady.js'
];

const dashboard = [
  '../../node_modules/simplemde/dist/simplemde.min.js',
  '../public/js/dashboard/scripts.js'
];

module.exports = {
  libs: libs.map(file => {
    return path.join(__dirname, file);
  }),
  scripts: scripts.map(file => {
    return path.join(__dirname, file);
  }),
  dashboard: dashboard.map(file => {
    return path.join(__dirname, file);
  }),
};
