'use strict';

const express = require('express');
let app = express();

const compression = require('compression');
//const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');

const path = require('path');

const MongoStore = require('connect-mongo')(session);
const db = require('./lib/mongo/connection');

module.exports = async () => {
  // Express setup
  //app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
  app.use(logger('dev'));
  app.use(compression());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(cookieParser());
  app.use(express.static(path.join(__dirname, 'public')));
  app.disable('x-powered-by');


  // Session setup
  app.use(session({
    secret: 'wow-what-a_secretkeyThisisForthis_website',
    saveUninitialized: false,
    resave: false,
    store: new MongoStore({
      mongooseConnection: db
    })
  }));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(flash());


  // Nunjucks
  app = require('./lib/booting/nunjucks.js')(app);


  // Defaults
  app.locals = require('./config/locals');


  // Setup Passport authentication
  require('./lib/authentication/setupPassport')();


  // SASS compliation and frontend JavaScript concatination
  app = await require('./lib/booting/sassJsFrontend')(app);

  // Routing
  app = require('./lib/booting/routing.js')(express, app);


  // Catch 404 and forward to error handler
  app.use((req, res, next) => {
    const error = new Error('Not Found');
    error.status = 404;
    next(error);
  });


  // Error handlers

  // Development error handler - will print stacktrace
  if (app.get('env') === 'development') {
    app.use((error, req, res) => {
      res.status(error.status || 500);
      console.error(error.message);

      res.render('error.njk', {
        message: error.message,
        error: error
      });
    });
  }


  // Production error handler - no stacktraces leaked to user
  app.use((error, req, res) => {
    res.status(error.status || 500);
    console.error(error.message);

    res.render('error.njk');
  });


  console.log('App started with:');
  console.log('- Node.js', process.version);
  console.log(`- Started with NODE_ENV=${app.get('env')}`);


  return app;
};
