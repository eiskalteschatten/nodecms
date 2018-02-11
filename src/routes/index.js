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
    items: [
      { name : pageTitle },
      { name : 'item #3' },
      { name : 'item #4' }
    ]
  });
});

module.exports = router;
