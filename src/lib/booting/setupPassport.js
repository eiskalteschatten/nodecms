'use strict';

const transLib = require('../../lib/translate');
const translate = transLib.translate;

const passport = require('passport');

const LocalStrategy = require('passport-local').Strategy;

const User = require('../../models/User');
const Organization = require('../../models/Organization');

const localConfig = {
  usernameField: 'emailAddress',
  passwordField: 'password',
  passReqToCallback: true
};

module.exports = () => {
  passport.use('local-login', new LocalStrategy(localConfig, (req, emailAddress, password, done) => {
    process.nextTick(() => {
      let finalUser;

      User.findOne({ emailAddress: emailAddress }).exec().then(user => {
        if (!user || !user.validPassword(password)) {
          return done(null, false, req.flash('loginMessage', translate(req.lang, 'emailAddressOrPasswordIncorrect', req.app.locals)));
        }

        finalUser = user;

        return Organization.findOne({ userId: user['_id'] }).exec();
      }).then(organization => {
        if (!organization) {
          return done(null, false, req.flash('loginMessage', translate(req.lang, 'anErrorOccurred', req.app.locals)));
        }

        req.session.organizationId = organization['_id'];
        req.session.organizationName = organization.name;
        req.session.settings = {};
        req.session.settings.languages = organization.settings.languages;

        return done(null, finalUser);
      }).catch(error => {
        console.error(error);
        done(error);
      });
    });
  }));

  passport.use('local-register', new LocalStrategy(localConfig, (req, emailAddress, password, done) => {
    process.nextTick(() => {
      const lang = req.lang;
      const body = req.body;
      let savedUser;

      User.findOne({emailAddress: emailAddress}).exec().then(user => {
        if (user) {
          return done(null, false, req.flash('registerMessage', translate(lang, 'emailAddressAlreadyTaken', req.app.locals)));
        }

        if (body.password !== body.repeatPassword) {
          return done(null, false, req.flash('registerMessage', translate(lang, 'passwordsDoNotMatch', req.app.locals)));
        }

        const newUser = new User({
          emailAddress: body.emailAddress,
          authType: 'local',
          accountType: 'standard'
        });

        newUser.password = newUser.generateHash(body.password);

        return newUser.save();
      }).then(user => {
        savedUser = user;

        const newOrganization = new Organization({
          name: body.organizationName,
          type: body.organizationType,
          userId: savedUser['_id'],
          settings: {
            languages: [body.defaultLanguage]
          }
        });

        return newOrganization.save();
      }).then(savedOrganization => {
        req.session.organizationId = savedOrganization['_id'];
        req.session.organizationName = savedOrganization.name;
        req.session.settings = {};
        req.session.settings.languages = savedOrganization.settings.languages;

        return done(null, savedUser);
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
