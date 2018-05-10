'use strict';

const express = require('express');
const router = express.Router();
// const cache = require('apicache').middleware;
const marked = require('marked');

const errorHandling = require('../../lib/errorHandling');
const helper = require('../../lib/helper');

const BlogPost = require('../../models/BlogPost');

router.get('/', async (req, res) => {
  const pageTitle = 'Blog Posts';
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


router.get('/new', (req, res) => {
  const pageTitle = 'Create New Blog Post';

  res.render('dashboard/blog/edit.njk', {
    pageTitle: pageTitle,
    pageId: 'newBlogPost',
    breadcrumbs: {
      '/dashboard/blog': 'Blog Posts',
      '/dashboard/blog/new': pageTitle,
    }
  });
});


router.get('/edit/:slug', async (req, res) => {
  const slug = req.params.slug;

  try {
    const blogPost = await BlogPost.findOne({slug: slug}).exec();
    let publishedDate;

    if (!blogPost) {
      return errorHandling.returnError({
        statusCode: 404,
        message: 'Blog post not found'
      }, res, req);
    }

    const pageTitle = 'Edit blog post';
    const breadcrumbs = {
      '/dashboard/blog': 'Blog Posts'
    };

    breadcrumbs[`/dashboard/blog/edit/${slug}`] = pageTitle;

    if (blogPost.published) {
      publishedDate = helper.formatDate(blogPost.published, 'LLL');
    }

    res.render('dashboard/blog/edit.njk', {
      pageTitle: pageTitle,
      pageId: 'editBlogPost',
      blogPost: blogPost,
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
    tags: [],
    categories: [],
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
