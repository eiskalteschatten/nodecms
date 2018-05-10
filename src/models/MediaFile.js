'use strict';

const mongoose = require('mongoose');
const db = require('../lib/mongo/connection');

const modelName = 'MediaFile';

const schema = new mongoose.Schema({
  name: String,
  slug: String,
  caption: String,
  description: String,
  path: String,
  mimeType: String,
  categories: [],
  tags: []
},
{
  collection: 'mediafiles',
  versionKey: false,
  timestamps: true
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
