'use strict';

const express = require('express');
const router = express.Router();
const cache = require('apicache').middleware;

const errorHandling = require('../../lib/errorHandling');

const BlogPost = require('../../models/BlogPost');

router.get('/', async (req, res) => {
  const pageTitle = 'Dashboard';
  const itemLimit = 5;

  try {
    const blogPosts = await BlogPost.getLatest(itemLimit);

    res.render('dashboard/index.njk', {
      pageTitle: pageTitle,
      pageId: pageTitle.toLowerCase(),
      blogPosts: blogPosts
    });
  }
  catch(error) {
    errorHandling.returnError(error, res, req);
  }
});

router.get('/markdown-guide', cache('1 day'), (req, res) => {
  res.render('dashboard/markdownGuide.njk');
});

router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/dashboard');
});

module.exports = router;
