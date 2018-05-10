'use strict';

const express = require('express');
const router = express.Router();
//const path = require('path');
const errorHandling = require('../../lib/errorHandling');

const MediaFile = require('../../models/MediaFile');
//const Categories = require('../../models/Categories');

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


router.post('/', async (req, res) => {
  try {
    const id = '';
    res.redirect(`/dashboard/media/edit/${id}`);
  }
  catch(error) {
    errorHandling.returnError(error, res, req);
  }
});


module.exports = router;
