'use strict';

const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  const pageTitle = 'Dashboard';

  res.render('dashboard/dashboard.njk', {
    pageTitle: pageTitle,
    pageId: pageTitle
  });
});

router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/dashboard');
});

module.exports = router;
