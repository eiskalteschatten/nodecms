'use strict';

const express = require('express');
const router = express.Router();
//const cache = require('apicache').middleware;

const errorHandling = require('../lib/errorHandling');
const helper = require('../lib/helper');
const uploadTypes = require('../config/uploadTypes');

const MediaFile = require('../models/MediaFile');
const Categories = require('../models/Categories');

router.get('/file/:slug', async (req, res) => {
    const slug = req.params.slug;

    try {
        const mediaFile = await MediaFile.findOne({slug: slug}).exec();
        const categories = await Categories.find({_id: {$in: mediaFile.categories}}).exec();

        if (!mediaFile) {
            return errorHandling.returnError({
                statusCode: 404,
                message: 'Media file not found'
            }, res, req);
        }

        const type = helper.getFileType(mediaFile);
        mediaFile.display = uploadTypes.fileTypes[type];

        const pageTitle = `Media file "${mediaFile.name}"`;
        const breadcrumbs = {};

        breadcrumbs[`/media/file/${slug}`] = pageTitle;

        res.render('media/index.njk', {
            pageTitle: pageTitle,
            pageId: 'mediaFile',
            mediaFile: mediaFile,
            categories: categories,
            breadcrumbs: breadcrumbs
        });
    }
    catch(error) {
        errorHandling.returnError(error, res, req);
    }
});

module.exports = router;
