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


router.get('/upload', (req, res) => {
  const pageTitle = 'Upload New File';

  res.render('dashboard/media/upload.njk', {
    pageTitle: pageTitle,
    pageId: 'uploadNewMediaFile',
    breadcrumbs: {
      '/dashboard/media': 'Media',
      '/dashboard/media/upload': pageTitle
    }
  });
});


module.exports = router;
