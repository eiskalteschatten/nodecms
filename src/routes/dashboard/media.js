'use strict';

const express = require('express');
const router = express.Router();
//const errorHandling = require('../../lib/errorHandling');


router.get('/', (req, res) => {
  const pageTitle = 'Media';

  res.render('dashboard/media/index.njk', {
    pageTitle: pageTitle,
    pageId: pageTitle.toLowerCase(),
    breadcrumbs: {
      '/dashboard/media': pageTitle
    }
  });
});


module.exports = router;
