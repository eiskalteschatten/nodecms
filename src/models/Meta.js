'use strict';

const mongoose = require('mongoose');
const db = require('../lib/mongo/connection');

const slug = require('slug');

const modelName = 'Meta';

const schema = new mongoose.Schema({
  name: String,
  slug: String,
  types: []
},
{
  collection: 'meta',
  versionKey: false,
  timestamps: true
});

schema.methods.createSlug = function(name) {
  return slug(name).replace( /([a-z])([A-Z])/g, '$1-$2' ).toLowerCase();
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
