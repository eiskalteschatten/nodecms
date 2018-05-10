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

  // TODO: loop through for all of them
  const file = files[0];
  const fileName = file.filename;
  const slug = helper.createSlug(fileName);

  const newMediaFile = new MediaFile({
    name: fileName,
    slug: slug,
    fileName: fileName,
    mimeType: file.mimetype
  });

  try {
    await newMediaFile.save();
    res.send(slug);
  }
  catch(error) {
    errorHandling.returnError(error, res, req);
  }
});


module.exports = router;
