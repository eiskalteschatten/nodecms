'use strict';

const express = require('express');
const router = express.Router();
// const errorHandling = require('../../lib/errorHandling');

// const Exhibition = require('../../models/Exhibition');

router.get('/', async (req, res) => {
  const pageTitle = 'Exhibitions';



  res.render('dashboard/exhibitions/index.njk', {
    pageTitle: pageTitle,
    pageId: pageTitle.toLowerCase(),
    breadcrumbs: {
      '/dashboard/exhibitions': pageTitle
    }
  });
});


router.get('/new', (req, res) => {
  const pageTitle = 'Create New Exhibition';

  res.render('dashboard/exhibitions/edit.njk', {
    pageTitle: pageTitle,
    pageId: 'newExhibition',
    breadcrumbs: {
      '/dashboard/exhibitions': 'Exhibitions',
      '/dashboard/exhibitions/new': pageTitle,
    }
  });
});


router.get('/new/exhibition-template', (req, res) => {
  const template = req.query.template;
  res.render(`dashboard/exhibitions/templates/${template}.njk`);
});


// router.patch('/', async (req, res) => {
//   const body = req.body;
//   const currentUserName = req.user.userName;
//   const newUserName = body.userName;
//   const setUser = {
//     userName: newUserName,
//     firstName: body.firstName,
//     lastName: body.lastName,
//     emailAddress: body.emailAddress
//   };

//   try {
//     const user = await User.findOne({userName: newUserName}).exec();

//     if (currentUserName !== newUserName && user) {
//       const newError = {
//         message: 'This username is already taken.',
//         statusCode: 409
//       };

//       throw newError;
//     }

//     await User.findOneAndUpdate({userName: currentUserName}, {$set: setUser}, {new: true}).exec();

//     res.send('Changes saved successfully.');
//   }
//   catch(error) {
//     errorHandling.returnError(error, res, req);
//   }
// });

module.exports = router;
