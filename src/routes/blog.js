'use strict';

const express = require('express');
const router = express.Router();
// const cache = require('apicache').middleware;

const errorHandling = require('../lib/errorHandling');
const helper = require('../lib/helper');

const BlogPost = require('../models/BlogPost');
const Categories = require('../models/Categories');
const MediaFile = require('../models/MediaFile');
const User = require('../models/User');

const limit = 10;


router.get('/', async (req, res) => {
    const pageTitle = 'Blog';
    const page = req.query.page || 0;

    try {
        const query = {
            status: 'published'
        };

        const blogPosts = await BlogPost.find(query).sort({published: 'desc'}).skip(page * limit).limit(limit).exec();
        const categories = await Categories.find().sort({name: 'asc'}).exec();
        const count = await BlogPost.find(query).count().exec();
        const numberOfPages = Math.ceil(count / limit);

        for (const i in blogPosts) {
            const featuredImage = blogPosts[i].featuredImage;
            if (featuredImage) {
                blogPosts[i].mediaFile = await MediaFile.findOne({_id: featuredImage}).exec();
            }
        }

        res.render('blog/index.njk', {
            pageTitle: pageTitle,
            pageId: pageTitle.toLowerCase(),
            blogPosts: blogPosts,
            numberOfPages: numberOfPages,
            page: page,
            categories: categories,
            previousPage: page > 0 ? parseInt(page) - 1 : 0,
            nextPage: page < (numberOfPages - 1) ? parseInt(page) + 1 : 0,
            breadcrumbs: {
                '/blog': pageTitle
            }
        });
    }
    catch(error) {
        errorHandling.returnError(error, res, req);
    }
});


router.get('/article/:slug', async (req, res) => {
    const slug = req.params.slug;

    try {
        const blogPost = await BlogPost.findOne({slug: slug, status: 'published'}).exec();
        const categories = await Categories.find({_id: {$in: blogPost.categories}}).exec();
        const featuredImage = blogPost.featuredImage ? await MediaFile.findOne({_id: blogPost.featuredImage}).exec() : '';
        const author = await User.findOne({userName: blogPost.author}).exec();

        let publishedDate;

        if (!blogPost) {
            return errorHandling.returnError({
                statusCode: 404,
                message: 'Blog post not found'
            }, res, req);
        }

        const pageTitle = blogPost.name;
        const breadcrumbs = {
            '/blog': 'Blog'
        };

        breadcrumbs[`/blog/article/${slug}`] = pageTitle;

        if (blogPost.published) {
            publishedDate = helper.formatDate(blogPost.published, 'LLL');
        }

        res.render('blog/article.njk', {
            pageTitle: pageTitle,
            pageId: 'blogPost',
            post: blogPost,
            categories: categories,
            author: author,
            publishedDate: publishedDate,
            featuredImage: featuredImage,
            breadcrumbs: breadcrumbs
        });
    }
    catch(error) {
        errorHandling.returnError(error, res, req);
    }
});


router.get('/category/:slug', async (req, res) => {
    const slug = req.params.slug;
    const page = req.query.page || 0;

    try {
        const category = await Categories.findOne({slug: slug}).exec();
        const categoryIdStr = category._id + '';

        const query = {
            status: 'published',
            categories: categoryIdStr
        };

        const blogPosts = await BlogPost.find(query).sort({published: 'desc'}).skip(page * limit).limit(limit).exec();
        const count = await BlogPost.find(query).count().exec();
        const numberOfPages = Math.ceil(count / limit);

        for (const i in blogPosts) {
            const featuredImage = blogPosts[i].featuredImage;
            if (featuredImage) {
                blogPosts[i].mediaFile = await MediaFile.findOne({_id: featuredImage}).exec();
            }
        }

        const pageTitle = category.name;
        const breadcrumbs = {
            '/blog': 'Blog'
        };

        breadcrumbs[`/blog/category/${slug}`] = pageTitle;

        res.render('blog/index.njk', {
            pageTitle: pageTitle,
            pageId: pageTitle.toLowerCase(),
            blogPosts: blogPosts,
            numberOfPages: numberOfPages,
            page: page,
            category: category,
            previousPage: page > 0 ? parseInt(page) - 1 : 0,
            nextPage: page < (numberOfPages - 1) ? parseInt(page) + 1 : 0,
            breadcrumbs: breadcrumbs
        });
    }
    catch(error) {
        errorHandling.returnError(error, res, req);
    }
});

module.exports = router;
