'use strict';

const express = require('express');
const router = express.Router();
const cache = require('apicache').middleware;

const errorHandling = require('../lib/errorHandling');

const MediaFile = require('../models/MediaFile');

router.get('/file/:slug', cache('5 minutes'), async (req, res) => {
    const slug = req.params.slug;

    try {
        const mediaFileObj = await MediaFile.getMediaFile({slug: slug});
        const mediaFile = mediaFileObj.results;

        if (!mediaFile) {
            return errorHandling.returnError({
                statusCode: 404,
                message: 'Media file not found'
            }, res, req);
        }

        const pageTitle = `Media file "${mediaFile.name}"`;
        const breadcrumbs = {};

        breadcrumbs[`/media/file/${slug}`] = pageTitle;

        res.render('media/index.njk', {
            pageTitle: pageTitle,
            pageId: 'mediaFile',
            mediaFile: mediaFile,
            categories: mediaFileObj.categories,
            breadcrumbs: breadcrumbs
        });
    }
    catch(error) {
        errorHandling.returnError(error, res, req);
    }
});

module.exports = router;
