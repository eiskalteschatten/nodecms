'use strict';

const express = require('express');
const router = express.Router();
const errorHandling = require('../../lib/errorHandling');

const passport = require('passport');

const tempToken = require('../../lib/authentication/tempToken');


router.get('/', (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect('/dashboard');
  }

  tempToken.createNewTempToken().then(authToken => {
    res.render('dashboard/login.njk', {
      pageTitle: 'Login',
      authToken: authToken,
      flashMessage: req.flash('loginMessage')
    });
  }).catch(error => {
    errorHandling.returnError(error, res, req);
  });
});


router.post('/', (req, res, next) => {
  tempToken.checkIfTokenIsValid(req.body.authToken).then(() => {
    passport.authenticate('local-login', (error, user) => {
      if (error) {
        console.error(new Error(error));
        return next(error);
      }

      if (!user) {
        return res.redirect('/dashboard/login');
      }

      req.logIn(user, error => {
        if (error) {
          console.error(new Error(error));
          return next(error);
        }

        return res.redirect('/dashboard');
      });
    })(req, res, next);
  }).catch(error => {
    if (error != 401) {
      console.error(new Error(error));
    }

    req.flash('loginMessage', 'An error occurred');
    res.redirect('/dashboard/login');
  });
});

module.exports = router;
