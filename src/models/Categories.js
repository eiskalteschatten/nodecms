'use strict';

const mongoose = require('mongoose');
const db = require('../lib/mongo/connection');

const modelName = 'Categories';

const schema = new mongoose.Schema({
    name: String,
    slug: String,
    description: String
},
{
    collection: 'categories',
    versionKey: false,
    timestamps: true
});


schema.statics.searchCategories = async function(query) {
    const queryRegex = new RegExp(query, 'i');

    const orQuery = [
        {name: {$regex: queryRegex}},
        {slug: {$regex: queryRegex}},
        {description: {$regex: queryRegex}}
    ];

    const categories = await this.find().or(orQuery).sort({published: 'desc'}).exec();
    const count = await this.find().or(orQuery).count().exec();

    return {
        categories: categories,
        count: count
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
