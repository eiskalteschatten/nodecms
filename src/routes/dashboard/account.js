'use strict';

const express = require('express');
const router = express.Router();
const errorHandling = require('../../lib/errorHandling');

const User = require('../../models/User');

router.get('/', (req, res) => {
  const pageTitle = 'Account';

  res.render('dashboard/account.njk', {
    pageTitle: pageTitle,
    pageId: pageTitle.toLowerCase()
  });
});


router.patch('/', async (req, res) => {
  const body = req.body;
  const currentUserName = req.user.userName;
  const newUserName = body.userName;
  const setUser = {
    userName: newUserName,
    firstName: body.firstName,
    lastName: body.lastName,
    emailAddress: body.emailAddress
  };

  try {
    const user = await User.findOne({userName: newUserName}).exec();

    if (currentUserName !== newUserName && user) {
      const newError = {
        message: 'This username is already taken.',
        statusCode: 409
      };

      throw newError;
    }

    await User.findOneAndUpdate({userName: currentUserName}, {$set: setUser}, {new: true}).exec();

    res.send('Changes saved successfully.');
  }
  catch(error) {
    errorHandling.returnError(error, res, req);
  }
});


router.patch('/password/', async (req, res) => {
  const body = req.body;
  const currentUserName = req.user.userName;

  if (body.password === body.repeatPassword) {
    try {
      const user = await User.findOne({userName: currentUserName}).exec();
      if (!user.validPassword(body.oldPassword)) {
        const newError = {
          message: 'Your old password is incorrect.',
          statusCode: 412
        };

        throw newError;
      }

      user.password = user.generateHash(body.password);

      await user.save();

      res.send('Changes saved successfully.');
    }
    catch(error) {
      errorHandling.returnError(error, res, req);
    }
  }
  else {
    res.status(412).send('Passwords do not match.');
  }
});

module.exports = router;
