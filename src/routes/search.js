'use strict';

const express = require('express');
const router = express.Router();

const errorHandling = require('../lib/errorHandling');
const config = require('../config/config.json');

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
    let pageTitle;
    let pageId;
    let searchResults;
    let template;

    const renderVars = {
        page: page,
        query: query,
    };

    switch(resultsType) {
        case 'blog':
            searchResults = await BlogPost.searchBlogPosts(query, page, resultsListLimit);
            template = 'search/blogPosts.njk';
            pageTitle = `Blog article search results for "${query}"`;
            pageId = 'searchResultsBlog';
            renderVars.blogPosts = searchResults.results;
            renderVars.categories = await Categories.find().sort({name: 'asc'}).exec();
            break;

        case 'media':
            searchResults = await MediaFile.searchMedia(query, page, resultsListLimit);
            template = 'search/media.njk';
            pageTitle = `Media file search results for "${query}"`;
            pageId = 'searchResultsMedia';
            renderVars.mediaFiles = searchResults.results;
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

    renderVars.breadcrumbs = breadcrumbs;
    renderVars.pageTitle = pageTitle;
    renderVars.pageId = pageId;
    renderVars.numberOfPages = searchResults.numberOfPages;
    renderVars.previousPage = searchResults.previousPage;
    renderVars.nextPage = searchResults.nextPage;

    res.render(template, renderVars);
});


async function renderInitialSearchResults(req, res, query) {
    const page = req.query.page || 0;

    try {
        const blogPostsObj = await BlogPost.searchBlogPosts(query, page, initialSearchLimit);
        const blogPosts = blogPostsObj.results;

        const categoriesObj = await Categories.searchCategories(query);
        const categories = categoriesObj.categories;

        const mediaFilesObj = await MediaFile.searchMedia(query, page, initialSearchLimit);
        const mediaFiles = mediaFilesObj.results;

        const pageTitle = `Search results for "${query}"`;
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


module.exports = router;
