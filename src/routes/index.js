'use strict';

const express = require('express');
const router = express.Router();
//const cache = require('apicache').middleware;

router.get('/', (req, res) => {
  const locals = req.app.locals;
  const pageTitle = 'Homepage';

  res.render('home/index.njk', {
    title: pageTitle,
    items: [
      { name : pageTitle },
      { name : 'item #3' },
      { name : 'item #4' }
    ]
  });
});

module.exports = router;
