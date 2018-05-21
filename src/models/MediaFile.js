'use strict';

const mongoose = require('mongoose');
const db = require('../lib/mongo/connection');

const helper = require('../lib/helper');
const uploadTypes = require('../config/uploadTypes');

const Categories = require('./Categories');

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


schema.statics.searchMedia = async function(query, page, limit, find={}) {
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
        {caption: {$regex: queryRegex}},
        {description: {$regex: queryRegex}},
        {fileName: {$regex: queryRegex}},
        {mimeType: {$regex: queryRegex}},
        {tags: {$regex: queryRegex}},
        {categories: {$in: categories}}
    ];

    let mediaFiles;

    if (limit) {
        mediaFiles = await this.find(find).or(orQuery).sort({updatedAt: 'desc'}).skip(page * limit).limit(limit).exec();
    }
    else {
        mediaFiles = await this.find(find).or(orQuery).sort({updatedAt: 'desc'});
    }

    const count = await this.find(find).or(orQuery).count().exec();

    const numberOfPages = Math.ceil(count / limit);

    for (const i in mediaFiles) {
        const type = helper.getFileType(mediaFiles[i]);
        mediaFiles[i].display = uploadTypes.fileTypes[type];
    }

    return {
        results: mediaFiles,
        count: count,
        numberOfPages: numberOfPages,
        previousPage: helper.calculatePreviousPage(page),
        nextPage: helper.calculateNextPage(page, numberOfPages)
    };
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
