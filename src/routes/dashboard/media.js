'use strict';

const express = require('express');
const router = express.Router();
//const path = require('path');
const errorHandling = require('../../lib/errorHandling');

const MediaFile = require('../../models/MediaFile');

//const pathToUploadDir = path.join(__dirname, '../../public/uploads');

router.get('/', async (req, res) => {
  const pageTitle = 'Media';

  try {
    const mediaFiles = await MediaFile.find().sort({updatedAt: 'desc'}).exec();

    res.render('dashboard/media/index.njk', {
      pageTitle: pageTitle,
      pageId: pageTitle.toLowerCase(),
      mediaFiles: mediaFiles,
      breadcrumbs: {
        '/dashboard/media': pageTitle
      }
    });
  }
  catch(error) {
    errorHandling.returnError(error, res, req);
  }
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
