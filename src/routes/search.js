'use strict';

const express = require('express');
const router = express.Router();
// const cache = require('apicache').middleware;

const errorHandling = require('../lib/errorHandling');
const config = require('../config/config.json');

const BlogPost = require('../models/BlogPost');
const Categories = require('../models/Categories');
//const MediaFile = require('../models/MediaFile');
//const User = require('../models/User');


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
    const limit = config.blogPostLimitDashboard;
    const page = req.query.page || 0;

    try {
        const queryRegex = new RegExp(query, 'i');
        const categoryIds = await Categories.find().or([
            {name: {$regex: queryRegex}},
            {slug: {$regex: queryRegex}},
            {description: {$regex: queryRegex}}
        ]).select('_id').exec();

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
        const breadcrumbs = {
            '/search': 'Search'
        };

        breadcrumbs[`/search/?query=${query}`] = pageTitle;

        res.render('search/results.njk', {
            pageTitle: pageTitle,
            pageId: pageTitle.toLowerCase(),
            blogPosts: blogPosts,
            numberOfPages: numberOfPages,
            page: page,
            previousPage: page > 0 ? parseInt(page) - 1 : 0,
            nextPage: page < (numberOfPages - 1) ? parseInt(page) + 1 : 0,
            query: query,
            breadcrumbs: breadcrumbs
        });
    }
    catch(error) {
        errorHandling.returnError(error, res, req);
    }
}

module.exports = router;
