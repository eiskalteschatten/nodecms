'use strict';

const mongoose = require('mongoose');
const db = require('../lib/mongo/connection');

const modelName = 'TempApiAuth';

const schema = new mongoose.Schema({
    token: String,
    validUntil: Date
},
{
    collection: 'auth',
    versionKey: false,
    timestamps: false
});

// Can add methods to the schema (http://mongoosejs.com/docs/index.html)

const Model = db.model(modelName, schema);

if (Model.on) {
    Model.on('index', error => {
        if (error) {
            console.error(error);
        }
    });
}

module.exports = Model;
