'use strict';

const nunjucks  = require('nunjucks');
const nunjucksMarkdown  = require('nunjucks-markdown');
const marked  = require('marked');
const path = require('path');
const slug = require('slug');

const helper = require('../helper');
const transLib = require('../translate');


module.exports = app => {
  // View engine setup
  app.set('view engine', 'html');

  const nunjucksEnv = nunjucks.configure(path.join(__dirname, '../../views'), {
    autoescape: true,
    express: app
  });


  // Custom filters in Nunjucks
  nunjucksEnv.addFilter('translate', (str, lang) => {
    return transLib.translate(lang, str, app.locals);
  });

  nunjucksEnv.addFilter('formatDate', (date, lang) => {
    return transLib.getLocalizedDate(date, lang);
  });

  nunjucksEnv.addFilter('cssClass', str => {
    if (str) {
      return slug(str).replace( /([a-z])([A-Z])/g, '$1-$2' ).toLowerCase();
    }
    return '';
  });

  // Globals
  nunjucksEnv.addGlobal('getCurrentYear', () => {
    return new Date().getFullYear();
  });

  nunjucksEnv.addGlobal('appLocals', app.locals);


  // Setup Nunjucks Markdown
  nunjucksMarkdown.register(nunjucksEnv, marked);


  // Set the app's engine to Nunjucks
  app.set('engine', nunjucksEnv);

  // Add the Express request globally to Nunjucks
  app.use((req, res, next) => {
    const engine = res.app.get('engine');
    const route = helper.parseRoute(req.originalUrl);

    engine.addGlobal('req', req);
    engine.addGlobal('plainRoute', route);
    engine.addGlobal('baseUrl', req.protocol + '://' + req.get('host'));

    next();
  });

  return app;
};
