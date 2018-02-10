'use strict';

const passport = require('passport');

const LocalStrategy = require('passport-local').Strategy;

const User = require('../../models/User');

const localConfig = {
  usernameField: 'userName',
  passwordField: 'password',
  passReqToCallback: true
};

module.exports = () => {
  passport.use('local-login', new LocalStrategy(localConfig, (req, userName, password, done) => {
    process.nextTick(() => {
      User.findOne({ userName: userName }).exec().then(user => {
        if (!user || !user.validPassword(password)) {
          return done(null, false, req.flash('loginMessage', 'Incorrect username or password.'));
        }

        return done(null, user);
      }).catch(error => {
        console.error(error);
        done(error);
      });
    });
  }));

  passport.use('local-register', new LocalStrategy(localConfig, (req, userName, password, done) => {
    process.nextTick(() => {
      const body = req.body;

      User.findOne({userName: userName}).exec().then(user => {
        if (user) {
          return done(null, false, req.flash('registerMessage', 'A user with this username already exists.'));
        }

        if (body.password !== body.repeatPassword) {
          return done(null, false, req.flash('registerMessage', 'The passwords do not match.'));
        }

        const newUser = new User({
          firstName: body.firstName,
          lastName: body.lastName,
          userName: body.userName,
          emailAddress: body.emailAddress,
          role: body.role
        });

        newUser.password = newUser.generateHash(body.password);

        return newUser.save();
      }).then(user => {
        return done(null, user);
      }).catch(error => {
        console.error(error);
        done(error);
      });
    });
  }));

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    User.findById(id, (error, user) => {
      done(error, user);
    });
  });
};
