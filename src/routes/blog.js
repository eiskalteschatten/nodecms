'use strict';

const express = require('express');
const router = express.Router();
// const cache = require('apicache').middleware;

const errorHandling = require('../lib/errorHandling');
const helper = require('../lib/helper');

const BlogPost = require('../models/BlogPost');
const Categories = require('../models/Categories');
const MediaFile = require('../models/MediaFile');


router.get('/', async (req, res) => {
    const pageTitle = 'Blog';
    const limit = 10;
    const page = req.query.page || 0;

    try {
        const query = {
            status: 'published'
        };

        const blogPosts = await BlogPost.find(query).sort({updatedAt: 'desc'}).skip(page * limit).limit(limit).exec();
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
            publishedDate: publishedDate,
            featuredImage: featuredImage,
            breadcrumbs: breadcrumbs
        });
    }
    catch(error) {
        errorHandling.returnError(error, res, req);
    }
});

module.exports = router;
