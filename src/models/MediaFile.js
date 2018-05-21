'use strict';

const mongoose = require('mongoose');
const db = require('../lib/mongo/connection');

const modelName = 'MediaFile';

const schema = new mongoose.Schema({
    name: String,
    slug: String,
    caption: String,
    description: String,
    fileName: String,
    fileType: String,
    mimeType: String,
    categories: [],
    tags: []
},
{
    collection: 'mediafiles',
    versionKey: false,
    timestamps: true
});

schema.statics.getLatest = function(limit) {
    return this.find().sort({updatedAt: 'desc'}).limit(limit).exec();
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
