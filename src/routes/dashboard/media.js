'use strict';

const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');

const errorHandling = require('../../lib/errorHandling');
const helper = require('../../lib/helper');
const uploadTypes = require('../../config/uploadTypes');

const MediaFile = require('../../models/MediaFile');
//const Categories = require('../../models/Categories');

const frontendPathToUploadDir = '/uploads';
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
        const mimeTypes = uploadTypes.mimeTypes;
        let i = 0;

        for (const file of mediaFiles) {
            const mimeType = file.mimeType;
            const mimeTypeParts = mimeType.split('/');
            let type;

            if (mimeTypes[mimeType]) {
                type = mimeTypes[mimeType].type;
            }
            else if (mimeTypes[mimeTypeParts[0]]) {
                type = mimeTypes[mimeTypeParts[0]].type;
            }
            else {
                type = 'other';
            }

            mediaFiles[i].fileType = type;
            mediaFiles[i].display = uploadTypes.fileTypes[type];

            i++;
        }

        res.render('dashboard/media/index.njk', {
            pageTitle: pageTitle,
            pageId: pageTitle.toLowerCase(),
            mediaFiles: mediaFiles,
            pathToFiles: frontendPathToUploadDir,
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

    for (const file of files) {
        const fileName = file.filename;
        const name = fileName.replace(/\.[^/.]+$/, '');
        const slug = helper.createSlug(name);

        try {
            const mediaFile = await MediaFile.findOne({slug: slug}).exec();

            if (mediaFile) {
                return errorHandling.returnError({
                    statusCode: 409,
                    message: `A media file with the name "${fileName}" already exists.`
                }, res, req);
            }

            const newMediaFile = {
                name: name,
                slug: slug,
                fileName: fileName,
                mimeType: file.mimetype
            };

            newMediaFiles.push(newMediaFile);
        }
        catch(error) {
            return errorHandling.returnError(error, res, req);
        }
    }
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
