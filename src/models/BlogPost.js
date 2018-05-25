'use strict';

const mongoose = require('mongoose');
const db = require('../lib/mongo/connection');

const helper = require('../lib/helper');
const config = require('../config/config.json');

const Categories = require('./Categories');
const MediaFile = require('./MediaFile');

const modelName = 'BlogPost';

const schema = new mongoose.Schema({
    name: String,
    slug: String,
    excerpt: String,
    markdown: String,
    html: String,
    tags: [],
    categories: [],
    author: String,
    lastEditedBy: String,
    status: String,
    published: Date,
    featuredImage: String,
    postType: String
},
{
    collection: 'blogPost',
    versionKey: false,
    timestamps: true
});


schema.statics.getLatest = function(limit, postType='blog') {
    return this.find({postType: postType}).sort({updatedAt: 'desc'}).limit(limit).exec();
};


schema.statics.getFrontendPosts = async function(query, page) {
    const limit = config.blogPostLimit;
    const blogPosts = await this.find(query).lt('published', new Date()).sort({published: 'desc'}).skip(page * limit).limit(limit).exec();
    const count = await this.find(query).count().exec();
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
        previousPage: helper.calculatePreviousPage(page),
        nextPage: helper.calculateNextPage(page, numberOfPages)
    };
};


schema.statics.searchBlogPosts = async function(query, page, limit, published=true, postType='blog') {
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

    let blogPosts;

    if (published) {
        blogPosts = await this.find({status: 'published', postType: postType}).or(orQuery).sort({published: 'desc'}).lt('published', new Date()).skip(page * limit).limit(limit).exec();
    }
    else {
        blogPosts = await this.find({postType: postType}).or(orQuery).sort({updatedAt: 'desc'}).skip(page * limit).limit(limit).exec();
    }

    const count = await this.find().or(orQuery).count().exec();
    const numberOfPages = Math.ceil(count / limit);

    return {
        results: blogPosts,
        count: count,
        numberOfPages: numberOfPages,
        previousPage: helper.calculatePreviousPage(page),
        nextPage: helper.calculateNextPage(page, numberOfPages)
    };
};


schema.methods.getStatus = function() {
    if (this.status === 'published' && this.published > new Date()) {
        return 'scheduled';
    }
    else if (this.status === 'published') {
        return 'published';
    }

    return 'draft';
};


const Model = db.model(modelName, schema);

if (Model.on) {
    Model.on('index', error => {
        if (error) {
            console.error(error);
        }
    });
}

module.exports = Model;
