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
const resultsListLimit = config.blogPostLimit;


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
        return renderInitialSearchResults(req, res, query);
    }
});


router.get('/:resultsType', async (req, res) => {
    const resultsType = req.params.resultsType;
    const query = req.query.query;
    const page = req.query.page || 0;
    const pageTitle = `Search results for "${query}"`;
    const pageId = 'search-results';
    const categories = await Categories.find().sort({name: 'asc'}).exec();
    let searchResults;
    let template;


    switch(resultsType) {
        case 'blog':
            searchResults = await searchBlogPosts(query, page, resultsListLimit);
            template = 'blog/index.njk';
            break;

        case 'categories':
            searchResults = await searchCategories(query, page, resultsListLimit);
            break;

        case 'media':
            searchResults = await searchMedia(query, page, resultsListLimit);
            break;

        default:
            return errorHandling.returnError({
                message: `No search results of type "${resultsType}" were found.`,
                statusCode: 404
            }, res, req);
    }

    const breadcrumbs = {
        '/search': 'Search'
    };

    breadcrumbs[`/search/${resultsType}/?query=${query}`] = pageTitle;

    res.render(template, {
        pageTitle: pageTitle,
        pageId: pageId,
        blogPosts: searchResults.results,
        numberOfPages: searchResults.numberOfPages,
        page: page,
        categories: categories,
        previousPage: searchResults.previousPage,
        nextPage: searchResults.nextPage,
        breadcrumbs: breadcrumbs
    });
});


async function renderInitialSearchResults(req, res, query) {
    const pageTitle = `Search results for "${query}"`;
    const page = req.query.page || 0;

    try {
        const blogPostsObj = await searchBlogPosts(query, page, initialSearchLimit);
        const blogPosts = blogPostsObj.results;

        const categoriesObj = await searchCategories(query, page, initialSearchLimit);
        const categories = categoriesObj.results;

        const mediaFilesObj = await searchMedia(query, page, initialSearchLimit);
        const mediaFiles = mediaFilesObj.results;

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

    const blogPosts = await BlogPost.find({status: 'published'}).or(orQuery).sort({published: 'desc'}).skip(page * limit).limit(limit).exec();
    const count = await BlogPost.find().or(orQuery).count().exec();
    const numberOfPages = Math.ceil(count / limit);

    return {
        results: blogPosts,
        count: count,
        numberOfPages: numberOfPages,
        previousPage: helper.calculatePreviousPage(page),
        nextPage: helper.calculateNextPage(page, numberOfPages)
    };
}


async function searchCategories(query, page, limit) {
    const queryRegex = new RegExp(query, 'i');

    const orQuery = [
        {name: {$regex: queryRegex}},
        {slug: {$regex: queryRegex}},
        {description: {$regex: queryRegex}}
    ];

    const categories = await Categories.find().or(orQuery).sort({published: 'desc'}).skip(page * limit).limit(limit).exec();
    const count = await Categories.find().or(orQuery).count().exec();
    const numberOfPages = Math.ceil(count / limit);

    return {
        results: categories,
        count: count,
        numberOfPages: numberOfPages,
        previousPage: helper.calculatePreviousPage(page),
        nextPage: helper.calculateNextPage(page, numberOfPages)
    };
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
    const count = await MediaFile.find().or(orQuery).count().exec();
    const numberOfPages = Math.ceil(count / limit);

    for (const i in mediaFiles) {
        const type = helper.getFileType(mediaFiles[i]);
        mediaFiles[i].display = uploadTypes.fileTypes[type];
    }

    return {
        results: mediaFiles,
        count: count,
        numberOfPages: numberOfPages,
        previousPage: helper.calculatePreviousPage(page),
        nextPage: helper.calculateNextPage(page, numberOfPages)
    };
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
