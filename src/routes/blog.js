'use strict';

const express = require('express');
const router = express.Router();
// const cache = require('apicache').middleware;

const errorHandling = require('../lib/errorHandling');
const helper = require('../lib/helper');
const config = require('../config/config.json');

const BlogPost = require('../models/BlogPost');
const Categories = require('../models/Categories');
const MediaFile = require('../models/MediaFile');
const User = require('../models/User');


router.get('/', async (req, res) => {
    const pageTitle = 'Blog';
    const page = req.query.page || 0;

    try {
        const query = {
            status: 'published'
        };

        const categories = await Categories.find().sort({name: 'asc'}).exec();
        const blogPostsObj = await getBlogPosts(query, page);
        const numberOfPages = blogPostsObj.numberOfPages;

        res.render('blog/index.njk', {
            pageTitle: pageTitle,
            pageId: pageTitle.toLowerCase(),
            blogPosts: blogPostsObj.blogPosts,
            numberOfPages: numberOfPages,
            page: page,
            categories: categories,
            previousPage: blogPostsObj.previousPage,
            nextPage: blogPostsObj.nextPage,
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
        const blogPost = await BlogPost.findOne({slug: slug, status: 'published'}).lt('published', new Date()).exec();

        if (!blogPost) {
            return errorHandling.returnError({
                statusCode: 404,
                message: 'Blog post not found'
            }, res, req);
        }

        const categories = await Categories.find({_id: {$in: blogPost.categories}}).exec();
        const featuredImage = blogPost.featuredImage ? await MediaFile.findOne({_id: blogPost.featuredImage}).exec() : '';
        const author = await User.findOne({userName: blogPost.author}).exec();

        let publishedDate;

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

        const blogPostsObj = await getBlogPosts(query, page);
        const numberOfPages = blogPostsObj.numberOfPages;

        const pageTitle = category.name;
        const breadcrumbs = {
            '/blog': 'Blog'
        };

        breadcrumbs[`/blog/category/${slug}`] = pageTitle;

        res.render('blog/category.njk', {
            pageTitle: pageTitle,
            pageId: pageTitle.toLowerCase(),
            blogPosts: blogPostsObj.blogPosts,
            numberOfPages: numberOfPages,
            page: page,
            category: category,
            previousPage: blogPostsObj.previousPage,
            nextPage: blogPostsObj.nextPage,
            breadcrumbs: breadcrumbs
        });
    }
    catch(error) {
        errorHandling.returnError(error, res, req);
    }
});


router.get('/tag/:tag', async (req, res) => {
    const tag = decodeURIComponent(req.params.tag);
    const page = req.query.page || 0;

    try {
        const query = {
            status: 'published',
            tags: tag
        };

        const blogPostsObj = await getBlogPosts(query, page);
        const numberOfPages = blogPostsObj.numberOfPages;

        const pageTitle = tag;
        const breadcrumbs = {
            '/blog': 'Blog'
        };

        breadcrumbs[`/blog/tag/${tag}`] = pageTitle;

        res.render('blog/tag.njk', {
            pageTitle: pageTitle,
            pageId: pageTitle.toLowerCase(),
            blogPosts: blogPostsObj.blogPosts,
            numberOfPages: numberOfPages,
            page: page,
            previousPage: blogPostsObj.previousPage,
            nextPage: blogPostsObj.nextPage,
            breadcrumbs: breadcrumbs
        });
    }
    catch(error) {
        errorHandling.returnError(error, res, req);
    }
});


router.get('/author/:userName', async (req, res) => {
    const userName = decodeURIComponent(req.params.userName);
    const page = req.query.page || 0;

    try {
        const author = await User.findOne({userName: userName}).exec();
        const fullName = `${author.firstName} ${author.lastName}`;

        const query = {
            status: 'published',
            author: userName
        };

        const blogPostsObj = await getBlogPosts(query, page);
        const numberOfPages = blogPostsObj.numberOfPages;

        const pageTitle = fullName;
        const breadcrumbs = {
            '/blog': 'Blog'
        };

        breadcrumbs[`/blog/author/${userName}`] = pageTitle;

        res.render('blog/author.njk', {
            pageTitle: pageTitle,
            pageId: pageTitle.toLowerCase(),
            blogPosts: blogPostsObj.blogPosts,
            numberOfPages: numberOfPages,
            page: page,
            previousPage: blogPostsObj.previousPage,
            nextPage: blogPostsObj.nextPage,
            breadcrumbs: breadcrumbs
        });
    }
    catch(error) {
        errorHandling.returnError(error, res, req);
    }
});


async function getBlogPosts(query, page) {
    const limit = config.blogPostLimit;
    const blogPosts = await BlogPost.find(query).lt('published', new Date()).sort({published: 'desc'}).skip(page * limit).limit(limit).exec();
    const count = await BlogPost.find(query).count().exec();
    const numberOfPages = Math.ceil(count / limit);

    for (const i in blogPosts) {
        const featuredImage = blogPosts[i].featuredImage;
        if (featuredImage) {
            blogPosts[i].mediaFile = await MediaFile.findOne({_id: featuredImage}).exec();
        }
    }

    return {
        blogPosts: blogPosts,
        numberOfPages: numberOfPages,
        previousPage: page > 0 ? parseInt(page) - 1 : 0,
        nextPage: page < (numberOfPages - 1) ? parseInt(page) + 1 : 0
    };
}

module.exports = router;
