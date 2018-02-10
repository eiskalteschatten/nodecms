'use strict';

const path = require('path');

module.exports = {
  'virtualRoutes': {
    '/js/jquery': path.join(__dirname, '../node_modules/jquery/dist/'),
    '/css/highlightjs': path.join(__dirname, '../node_modules/highlight.js/styles/')
  },
  'controllerRoutes': {
    'public': {
      '/': './routes/index'
    }
  }
};
