'use strict';

const mongoose = require('mongoose');
const db = require('../lib/mongo/connection');

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
    featuredImage: String
},
{
    collection: 'blogPost',
    versionKey: false,
    timestamps: true
});

schema.statics.getLatest = function(limit) {
    return this.find().sort({updatedAt: 'desc'}).limit(limit).exec();
};

schema.statics.getLatestPublished = function(limit) {
    return this.find({status: 'published'}).sort({updatedAt: 'desc'}).limit(limit).exec();
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
