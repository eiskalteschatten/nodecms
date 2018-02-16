'use strict';

const mongoose = require('mongoose');
const db = require('../lib/mongo/connection');

const modelName = 'Exhibition';

const texts = new mongoose.Schema({
  markdown: String,
  html: String
});

const schema = new mongoose.Schema({
  name: String,
  description: String,
  template: String,
  texts: [texts],
  media: [],
  meta: [],
  author: String,
  lastEditedBy: String
},
{
  collection: 'exihibitions',
  versionKey: false,
  timestamps: true
});

const Model = db.model(modelName, schema);

if (Model.on) {
  Model.on('index', error => {
    if (error) {
      console.error(error);
    }
  });
}

module.exports = Model;
