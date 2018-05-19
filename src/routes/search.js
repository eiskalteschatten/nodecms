'use strict';

const express = require('express');
const router = express.Router();
// const cache = require('apicache').middleware;

const errorHandling = require('../lib/errorHandling');
const helper = require('../lib/helper');
const config = require('../config/config.json');
const uploadTypes = require('../config/uploadTypes');

const BlogPost = require('../models/BlogPost');
const Categories = require('../models/Categories');
const MediaFile = require('../models/MediaFile');

const initialSearchLimit = config.initialSearchLimit;
//const resultsListLimit = config.blogPostLimit;


router.get('/', async (req, res) => {
    const query = req.query.query;

    if (!query) {
        const pageTitle = 'Search';

        res.render('search/index.njk', {
            pageTitle: pageTitle,
            pageId: pageTitle.toLowerCase(),
            breadcrumbs: {
                '/search': pageTitle
            }
        });
    }
    else {
        return renderSearchResults(req, res, query);
    }
});


async function renderSearchResults(req, res, query) {
    const pageTitle = `Search results for "${query}"`;
    const page = req.query.page || 0;

    try {
        const blogPosts = await searchBlogPosts(query, page, initialSearchLimit);
        const categories = await searchCategories(query, page, initialSearchLimit);
        const mediaFiles = await searchMedia(query, page, initialSearchLimit);

        const breadcrumbs = {
            '/search': 'Search'
        };

        breadcrumbs[`/search/?query=${query}`] = pageTitle;

        res.render('search/results.njk', {
            pageTitle: pageTitle,
            pageId: pageTitle.toLowerCase(),
            blogPosts: blogPosts,
            categories: categories,
            mediaFiles: mediaFiles,
            query: query,
            breadcrumbs: breadcrumbs
        });
    }
    catch(error) {
        errorHandling.returnError(error, res, req);
    }
}


async function searchBlogPosts(query, page, limit) {
    const queryRegex = new RegExp(query, 'i');
    const categoryIds = await getCategoryIds(query);

    const categories = categoryIds.map(categoryId => {
        return categoryId._id + '';
    });

    const orQuery = [
        {name: {$regex: queryRegex}},
        {slug: {$regex: queryRegex}},
        {excerpt: {$regex: queryRegex}},
        {markdown: {$regex: queryRegex}},
        {tags: {$regex: queryRegex}},
        {author: {$regex: queryRegex}},
        {status: {$regex: queryRegex}},
        {categories: {$in: categories}}
    ];

    return await BlogPost.find({status: 'published'}).or(orQuery).sort({published: 'desc'}).skip(page * limit).limit(limit).exec();
}


async function searchCategories(query, page, limit) {
    const queryRegex = new RegExp(query, 'i');

    return await Categories.find().or([
        {name: {$regex: queryRegex}},
        {slug: {$regex: queryRegex}},
        {description: {$regex: queryRegex}}
    ]).sort({published: 'desc'}).skip(page * limit).limit(limit).exec();
}


async function searchMedia(query, page, limit) {
    const queryRegex = new RegExp(query, 'i');
    const categoryIds = await getCategoryIds(query);

    const categories = categoryIds.map(categoryId => {
        return categoryId._id + '';
    });

    const orQuery = [
        {name: {$regex: queryRegex}},
        {slug: {$regex: queryRegex}},
        {caption: {$regex: queryRegex}},
        {description: {$regex: queryRegex}},
        {fileName: {$regex: queryRegex}},
        {mimeType: {$regex: queryRegex}},
        {tags: {$regex: queryRegex}},
        {categories: {$in: categories}}
    ];

    const mediaFiles = await MediaFile.find().or(orQuery).sort({updatedAt: 'desc'}).skip(page * limit).limit(limit).exec();

    for (const i in mediaFiles) {
        const type = helper.getFileType(mediaFiles[i]);
        mediaFiles[i].display = uploadTypes.fileTypes[type];
    }

    return mediaFiles;
}


async function getCategoryIds(query) {
    const queryRegex = new RegExp(query, 'i');
    return await Categories.find().or([
        {name: {$regex: queryRegex}},
        {slug: {$regex: queryRegex}},
        {description: {$regex: queryRegex}}
    ]).select('_id').exec();
}

module.exports = router;
