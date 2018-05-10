'use strict';

const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const errorHandling = require('../../lib/errorHandling');

const MediaFile = require('../../models/MediaFile');
//const Categories = require('../../models/Categories');

const pathToUploadDir = path.join(__dirname, '../../public/uploads');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, pathToUploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});
const upload = multer({storage: storage});

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


router.post('/', upload.array('files'), async (req, res) => {
  //const files = req.files;

  try {
    const id = '';
    res.send(id);
  }
  catch(error) {
    errorHandling.returnError(error, res, req);
  }
});


module.exports = router;
