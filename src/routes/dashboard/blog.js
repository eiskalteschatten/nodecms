'use strict';

const express = require('express');
const router = express.Router();
const marked = require('marked');

const errorHandling = require('../../lib/errorHandling');
const helper = require('../../lib/helper');
const config = require('../../config/config.json');
const postTypes = require('../../config/postTypes.json');

const BlogPost = require('../../models/BlogPost');
const Categories = require('../../models/Categories');
const MediaFile = require('../../models/MediaFile');
const User = require('../../models/User');


router.get('/', async (req, res) => {
    const pageTitle = 'Blog';
    const limit = config.blogPostLimitDashboard;
    const page = req.query.page || 0;
    const search = req.query.search;
    let blogPosts;
    let count;

    try {
        if (search) {
            const blogPostsObj = await BlogPost.searchBlogPosts(search, page, limit, false);
            blogPosts = blogPostsObj.results;
            count = blogPostsObj.count;
        }
        else {
            blogPosts = await BlogPost.find({postType: 'blog'}).sort({updatedAt: 'desc'}).skip(page * limit).limit(limit).exec();
            count = await BlogPost.find().count().exec();
        }

        const numberOfPages = Math.ceil(count / limit);

        res.render('dashboard/blog/index.njk', {
            pageTitle: pageTitle,
            pageId: pageTitle.toLowerCase(),
            blogPosts: blogPosts,
            numberOfPages: numberOfPages,
            page: page,
            previousPage: helper.calculatePreviousPage(page),
            nextPage: helper.calculateNextPage(page, numberOfPages),
            search: search,
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
        const categories = await Categories.find().exec();

        res.render('dashboard/blog/edit.njk', {
            pageTitle: pageTitle,
            pageId: 'newBlogPost',
            categories: categories,
            postTypes: postTypes,
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
        const categories = await Categories.find().exec();
        const featuredImage = blogPost.featuredImage ? await MediaFile.findOne({_id: blogPost.featuredImage}).exec() : '';

        const publishedDateUnformatted = blogPost.published;
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

        if (publishedDateUnformatted) {
            publishedDate = helper.formatDate(publishedDateUnformatted, 'LLL');
        }

        res.render('dashboard/blog/edit.njk', {
            pageTitle: pageTitle,
            pageId: 'editBlogPost',
            post: blogPost,
            categories: categories,
            publishedDate: publishedDate,
            featuredImage: featuredImage,
            postTypes: postTypes,
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
        status: status === 'scheduled' ? 'published' : status,
        featuredImage: body.featuredImage || '',
        postType: body.postType
    };

    if (isBeingPublished) {
        setBlogPost.published = new Date();
    }
    else if (status === 'scheduled') {
        setBlogPost.published = new Date(body.scheduledDate);
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


router.get('/preview/:slug', async (req, res) => {
    const slug = req.params.slug;

    try {
        const blogPost = await BlogPost.findOne({slug: slug}).exec();
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

module.exports = router;
