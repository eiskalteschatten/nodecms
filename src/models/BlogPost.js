'use strict';

const mongoose = require('mongoose');
const db = require('../lib/mongo/connection');

const modelName = 'BlogPost';

const schema = new mongoose.Schema({
  name: {},
  slug: {},
  markdown: {},
  html: {},
  tags: {},
  categories: [],
  author: String,
  status: String,
  published: Date
},
{
  collection: 'blogPost',
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
