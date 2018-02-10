'use strict';

const path = require('path');

const routes = require('../../config/routes');

module.exports = (express, app) => {
  // Virtual routes
  for (const routePath of Object.keys(routes.virtualRoutes)) {
    const router = routes.virtualRoutes[routePath];

    if (typeof router === 'object') {
      if (router.excludeEnv && router.excludeEnv.indexOf(app.get('env')) === -1) {
        const pathToRouteScript = path.join('../../', router.router);
        app.use(routePath, express.static(pathToRouteScript));
      }
    }
    else {
      const pathToRouteScript = path.join('../../', router);
      app.use(routePath, express.static(pathToRouteScript));
    }
  }


  // Controller routes
  for (const type of Object.keys(routes.controllerRoutes)) {
    const routesToInclude = routes.controllerRoutes[type];

    for (const routePath of Object.keys(routesToInclude)) {
      const router = routesToInclude[routePath];

      const isLoggedIn = (req, res, next) => {
        if (req.isAuthenticated()) {
          return next();
        }
        res.redirect('/admin/login');
      };

      const appUse = (routePath, require) => {
        if (type === 'public') {
          app.use(routePath, require);
        }
        else {
          // If authentication is necessary for the route, do it here
          app.use(routePath, isLoggedIn, require);
        }
      };

      if (typeof router === 'object') {
        if (router.excludeEnv && router.excludeEnv.indexOf(app.get('env')) === -1) {
          const pathToRouteScript = path.join('../../', router.router);
          appUse(routePath, require(pathToRouteScript));
        }
      }
      else {
        const pathToRouteScript = path.join('../../', router);
        appUse(routePath, require(pathToRouteScript));
      }
    }
  }

  return app;
};
