'use strict';

const express = require('express');
const router = express.Router();
const cache = require('apicache').middleware;

const errorHandling = require('../../lib/errorHandling');

const Exhibition = require('../../models/Exhibition');

router.get('/', async (req, res) => {
  const pageTitle = 'Dashboard';
  const itemLimit = 5;

  try {
    const exhibitions = await Exhibition.find().sort({updatedAt: 'desc'}).limit(itemLimit).exec();

    res.render('dashboard/index.njk', {
      pageTitle: pageTitle,
      pageId: pageTitle.toLowerCase(),
      exhibitions: exhibitions,
    });
  }
  catch(error) {
    errorHandling.returnError(error, res, req);
  }
});

router.get('/markdown-guide', cache('1 day'), (req, res) => {
  res.render('dashboard/markdownGuide.njk');
});

router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/dashboard');
});

module.exports = router;
