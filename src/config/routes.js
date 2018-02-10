'use strict';

const path = require('path');

module.exports = {
  'virtualRoutes': {
    '/js/jquery': path.join(__dirname, '../node_modules/jquery/dist/')
  },
  'controllerRoutes': {
    'public': {
      '/': './routes/index',
      '/admin/login': './routes/admin/login'
    },
    'auth': {
      '/admin/': './routes/admin/index',
    }
  }
};
