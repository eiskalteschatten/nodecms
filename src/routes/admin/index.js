'use strict';

const express = require('express');
const router = express.Router();
//const cache = require('apicache').middleware;

router.get('/', (req, res) => {
  const pageTitle = 'Dashboard';

  res.render('admin/dashboard.njk', {
    pageTitle: pageTitle,
    pageId: pageTitle,
    items: [
      { name : pageTitle },
      { name : 'item #3' },
      { name : 'item #4' }
    ]
  });
});

router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/admin');
});

module.exports = router;
