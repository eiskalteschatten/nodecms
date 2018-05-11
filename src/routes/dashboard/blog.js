'use strict';

const express = require('express');
const router = express.Router();
// const cache = require('apicache').middleware;
const marked = require('marked');

const errorHandling = require('../../lib/errorHandling');
const helper = require('../../lib/helper');

const BlogPost = require('../../models/BlogPost');
const Categories = require('../../models/Categories');

router.get('/', async (req, res) => {
    const pageTitle = 'Blog';
    const limit = 10;
    const page = req.query.page || 0;

    try {
        const count = await BlogPost.count().exec();
        const blogPosts = await BlogPost.find().sort({updatedAt: 'desc'}).skip(page * limit).limit(limit).exec();
        const numberOfPages = Math.ceil(count / limit);

        res.render('dashboard/blog/index.njk', {
            pageTitle: pageTitle,
            pageId: pageTitle.toLowerCase(),
            blogPosts: blogPosts,
            numberOfPages: numberOfPages,
            page: page,
            previousPage: page > 0 ? parseInt(page) - 1 : 0,
            nextPage: page < (numberOfPages - 1) ? parseInt(page) + 1 : 0,
            breadcrumbs: {
                '/dashboard/blog': pageTitle
            }
        });
    }
    catch(error) {
        errorHandling.returnError(error, res, req);
    }
});


router.get('/new', async (req, res) => {
    const pageTitle = 'Create New Blog Post';

    try {
        const categories = await Categories.find({}).exec();

        res.render('dashboard/blog/edit.njk', {
            pageTitle: pageTitle,
            pageId: 'newBlogPost',
            categories: categories,
            breadcrumbs: {
                '/dashboard/blog': 'Blog',
                '/dashboard/blog/new': pageTitle,
            }
        });
    }
    catch(error) {
        errorHandling.returnError(error, res, req);
    }
});


router.get('/edit/:slug', async (req, res) => {
    const slug = req.params.slug;

    try {
        const blogPost = await BlogPost.findOne({slug: slug}).exec();
        const categories = await Categories.find({}).exec();
        let publishedDate;

        if (!blogPost) {
            return errorHandling.returnError({
                statusCode: 404,
                message: 'Blog post not found'
            }, res, req);
        }

        const pageTitle = 'Edit blog post';
        const breadcrumbs = {
            '/dashboard/blog': 'Blog'
        };

        breadcrumbs[`/dashboard/blog/edit/${slug}`] = pageTitle;

        if (blogPost.published) {
            publishedDate = helper.formatDate(blogPost.published, 'LLL');
        }

        res.render('dashboard/blog/edit.njk', {
            pageTitle: pageTitle,
            pageId: 'editBlogPost',
            post: blogPost,
            categories: categories,
            publishedDate: publishedDate,
            breadcrumbs: breadcrumbs
        });
    }
    catch(error) {
        errorHandling.returnError(error, res, req);
    }
});


router.post('/edit', async (req, res) => {
    const body = req.body;
    let blogPostId = body.blogPostId;
    const slug = helper.createSlug(body.name);
    const markdown = body.markdown;
    const status = body.status;
    const currentUser = req.user.userName;
    const isBeingPublished = status === 'published' && body.currentStatus !== 'published';

    const setBlogPost = {
        name: body.name,
        slug: slug,
        excerpt: body.excerpt,
        markdown: markdown,
        html: marked(markdown),
        tags: body.tags,
        categories: body.categories,
        lastEditedBy: currentUser,
        status: status
    };

    if (isBeingPublished) {
        setBlogPost.published = new Date();
    }

    try {
        let blogPost;

        if (!blogPostId) {
            const blogPostWithSlug = await BlogPost.findOne({slug: slug}).exec();

            if (blogPostWithSlug) {
                return errorHandling.returnError({
                    message: 'A blog post with that title already exists. Please choose a new title.',
                    statusCode: 409
                }, res, req);
            }
        }
        else {
            blogPost = await BlogPost.findById(blogPostId).exec();

            if (blogPost) {
                blogPost.set(setBlogPost);
            }
        }

        if (!blogPost) {
            setBlogPost.author = currentUser;
            blogPost = new BlogPost(setBlogPost);
            blogPostId = blogPost._id;
        }

        blogPost.slug = slug;

        await blogPost.save();

        res.json({
            slug: slug,
            status: blogPost.status
        });
    }
    catch(error) {
        errorHandling.returnError(error, res, req);
    }
});


router.delete('/edit', async (req, res) => {
    try {
        await BlogPost.findOneAndRemove({_id: req.body.blogPostId}).exec();
        res.send('ok');
    }
    catch(error) {
        errorHandling.returnError(error, res, req);
    }
});

module.exports = router;
