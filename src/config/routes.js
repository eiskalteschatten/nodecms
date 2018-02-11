'use strict';

const path = require('path');

module.exports = {
  'virtualRoutes': {
    '/js/jquery': path.join(__dirname, '../node_modules/jquery/dist/')
  },
  'controllerRoutes': {
    'public': {
      '/': './routes/index',
      '/dashboard/login': './routes/dashboard/login'
    },
    'auth': {
      '/dashboard/': './routes/dashboard/index',
      '/dashboard/account': './routes/dashboard/account',
    }
  }
};
