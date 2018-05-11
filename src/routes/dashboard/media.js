'use strict';

const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');

const errorHandling = require('../../lib/errorHandling');
const helper = require('../../lib/helper');
const uploadTypes = require('../../config/uploadTypes');

const MediaFile = require('../../models/MediaFile');
const Categories = require('../../models/Categories');

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
        let i = 0;

        for (const file of mediaFiles) {
            const type = getFileType(file);
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


router.get('/edit/:slug', async (req, res) => {
    const slug = req.params.slug;

    try {
        const mediaFile = await MediaFile.findOne({slug: slug}).exec();
        const categories = await Categories.find({}).exec();

        if (!mediaFile) {
            return errorHandling.returnError({
                statusCode: 404,
                message: 'Media file not found'
            }, res, req);
        }

        const type = getFileType(mediaFile);
        mediaFile.fileType = type;
        mediaFile.display = uploadTypes.fileTypes[type];

        const pageTitle = 'Edit media file';
        const breadcrumbs = {
            '/dashboard/media': 'Media'
        };

        breadcrumbs[`/dashboard/media/edit/${slug}`] = pageTitle;

        res.render('dashboard/media/edit.njk', {
            pageTitle: pageTitle,
            pageId: 'editMediaFile',
            post: mediaFile,
            pathToFiles: frontendPathToUploadDir,
            categories: categories,
            breadcrumbs: breadcrumbs
        });
    }
    catch(error) {
        errorHandling.returnError(error, res, req);
    }
});


router.patch('/', async (req, res) => {
    const body = req.body;
    const name = body.name;
    const slug = helper.createSlug(name);

    const setMediaFile = {
        name: name,
        slug: slug,
        caption: body.caption,
        description: body.description,
        categories: body.categories,
        tags: body.tags
    };

    try {
        await MediaFile.findOneAndUpdate({_id: body.id}, {$set: setMediaFile}, {new: true}).exec();
        res.send(slug);
    }
    catch(error) {
        errorHandling.returnError(error, res, req);
    }
});


function getFileType(file) {
    const mimeTypes = uploadTypes.mimeTypes;
    const mimeType = file.mimeType;
    const mimeTypeParts = mimeType.split('/');

    if (mimeTypes[mimeType]) {
        return mimeTypes[mimeType].type;
    }
    else if (mimeTypes[mimeTypeParts[0]]) {
        return mimeTypes[mimeTypeParts[0]].type;
    }
    else {
        return 'other';
    }
}

module.exports = router;
