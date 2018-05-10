'use strict';

const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');

const errorHandling = require('../../lib/errorHandling');
const helper = require('../../lib/helper');

const MediaFile = require('../../models/MediaFile');
//const Categories = require('../../models/Categories');

//const frontendPathToUploadDir = 'uploads';
const fullPathToUploadDir = path.join(__dirname, '../../public/uploads');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, fullPathToUploadDir);
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
  const files = req.files;
  const newMediaFiles = [];

  files.forEach(file => {
    const fileName = file.filename;
    const name = fileName.replace(/\.[^/.]+$/, '');

    const newMediaFile = {
      name: name,
      slug: helper.createSlug(name),
      fileName: fileName,
      mimeType: file.mimetype
    };

    newMediaFiles.push(newMediaFile);
  });

  try {
    const savedMediaFiles = await MediaFile.insertMany(newMediaFiles);

    if (savedMediaFiles.length > 1) {
      res.send('/dashboard/media');
    }
    else {
      res.send(`/dashboard/media/edit/${savedMediaFiles[0].slug}`);
    }
  }
  catch(error) {
    errorHandling.returnError(error, res, req);
  }
});


module.exports = router;
