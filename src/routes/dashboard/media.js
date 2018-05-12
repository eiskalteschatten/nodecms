'use strict';

const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const fs = require('fs');

const errorHandling = require('../../lib/errorHandling');
const helper = require('../../lib/helper');
const uploadTypes = require('../../config/uploadTypes');

const MediaFile = require('../../models/MediaFile');
const Categories = require('../../models/Categories');

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

const thumbnailLimit = 30;


router.get('/', async (req, res) => {
    const pageTitle = 'Media';
    const page = req.query.page || 0;

    try {
        const mediaFiles = await MediaFile.find().sort({updatedAt: 'desc'}).skip(page * thumbnailLimit).limit(thumbnailLimit).exec();
        const count = await MediaFile.count().exec();
        const numberOfPages = Math.ceil(count / thumbnailLimit);
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
            numberOfPages: numberOfPages,
            page: page,
            previousPage: page > 0 ? parseInt(page) - 1 : 0,
            nextPage: page < (numberOfPages - 1) ? parseInt(page) + 1 : 0,
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


router.get('/select', async (req, res) => {
    const pageTitle = 'Select Media';
    const page = req.query.page || 0;

    try {
        const mediaFiles = await MediaFile.find().sort({updatedAt: 'desc'}).skip(page * thumbnailLimit).limit(thumbnailLimit).exec();
        const count = await MediaFile.count().exec();
        const numberOfPages = Math.ceil(count / thumbnailLimit);
        let i = 0;

        for (const file of mediaFiles) {
            const type = getFileType(file);
            mediaFiles[i].fileType = type;
            mediaFiles[i].display = uploadTypes.fileTypes[type];
            i++;
        }

        res.render('dashboard/media/select.njk', {
            pageTitle: pageTitle,
            pageId: pageTitle.toLowerCase(),
            mediaFiles: mediaFiles,
            numberOfPages: numberOfPages,
            page: page,
            previousPage: page > 0 ? parseInt(page) - 1 : 0,
            nextPage: page < (numberOfPages - 1) ? parseInt(page) + 1 : 0
        });
    }
    catch(error) {
        errorHandling.returnError(error, res, req);
    }
});


router.get('/select/featured', async (req, res) => {
    const pageTitle = 'Select Featured Image';
    const page = req.query.page || 0;

    try {
        const mediaFilesResults = await MediaFile.find().sort({updatedAt: 'desc'}).skip(page * thumbnailLimit).limit(thumbnailLimit).exec();
        const count = await MediaFile.count().exec();
        const numberOfPages = Math.ceil(count / thumbnailLimit);
        const mediaFiles = [];

        for (const file of mediaFilesResults) {
            const type = getFileType(file);

            if (type === 'image') {
                file.fileType = type;
                file.display = uploadTypes.fileTypes[type];
                mediaFiles.push(file);
            }
        }

        res.render('dashboard/media/select.njk', {
            pageTitle: pageTitle,
            pageId: pageTitle.toLowerCase(),
            mediaFiles: mediaFiles,
            numberOfPages: numberOfPages,
            page: page,
            previousPage: page > 0 ? parseInt(page) - 1 : 0,
            nextPage: page < (numberOfPages - 1) ? parseInt(page) + 1 : 0
        });
    }
    catch(error) {
        errorHandling.returnError(error, res, req);
    }
});


router.delete('/', (req, res) => {
    const body = req.body;

    fs.unlink(path.join(fullPathToUploadDir, body.fileName), async error => {
        if (error) {
            errorHandling.returnError(error, res, req);
        }

        try {
            await MediaFile.findOneAndRemove({_id: req.body.id}).exec();
            res.send('ok');
        }
        catch(error) {
            errorHandling.returnError(error, res, req);
        }
    });
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
