'use strict';

const express = require('express');
const router = express.Router();
const cache = require('apicache').middleware;
const RSS = require('rss');

const errorHandling = require('../lib/errorHandling');
const config = require(`../config/envs/${process.env.NODE_ENV}.json`);
const siteUrl = config.url;

const BlogPost = require('../models/BlogPost');
const Categories = require('../models/Categories');
const User = require('../models/User');


router.get('/', cache('1 hour'), async (req, res) => {
    try {
        const blogPostsObj = await BlogPost.getFrontendPosts({ status: 'published', postType: 'blog' });
        const blogPosts = blogPostsObj.blogPosts;

        const feed = new RSS({
            title: 'NodeCMS RSS Feed',
            feed_url: `${siteUrl}/rss`,
            pubDate: blogPosts[0].published,
            language: 'en'
        });

        for (const blogPost of blogPosts) {
            const author = await User.findOne({userName: blogPost.author}).exec();

            const categoryResults = await Categories.find({_id: {$in: blogPost.categories}}).exec();
            const categories = categoryResults.map(result => {
                return result.name;
            });

            feed.item({
                title: blogPost.name,
                description: blogPost.excerpt,
                url: `${siteUrl}/blog/article/${blogPost.slug}`,
                categories: categories,
                author: `${author.firstName} ${author.lastName}`,
                date: blogPost.published
            });
        }

        res.set('Content-Type', 'text/xml');
        res.send(feed.xml());
    }
    catch(error) {
        errorHandling.returnError(error, res, req);
    }
});

module.exports = router;
