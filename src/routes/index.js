'use strict';

const express = require('express');
const router = express.Router();
//const cache = require('apicache').middleware;

const track = require('../lib/matomo');

router.get('/', (req, res) => {
  const pageTitle = 'Homepage';

  track(req, pageTitle);

  res.render('home/index.njk', {
    pageTitle: pageTitle,
    pageId: pageTitle.toLowerCase()
  });
});

module.exports = router;
