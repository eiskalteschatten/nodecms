'use strict';

const path = require('path');

module.exports = {
    'virtualRoutes': {
        '/libs/simplemde': path.join(__dirname, '../../node_modules/simplemde/dist/')
    },
    'controllerRoutes': {
        'public': {
            '/': './routes/index',
            '/blog': './routes/blog',
            '/search': './routes/search',
            '/media': './routes/media',
            '/dashboard/login': './routes/dashboard/login'
        },
        'auth': {
            '/dashboard/': './routes/dashboard/index',
            '/dashboard/blog': './routes/dashboard/blog',
            '/dashboard/categories': './routes/dashboard/categories',
            '/dashboard/media': './routes/dashboard/media',
            '/dashboard/users': './routes/dashboard/users'
        }
    }
};
