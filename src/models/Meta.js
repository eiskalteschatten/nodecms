'use strict';

const mongoose = require('mongoose');
const db = require('../lib/mongo/connection');

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

const Model = db.model(modelName, schema);

if (Model.on) {
  Model.on('index', error => {
    if (error) {
      console.error(error);
    }
  });
}

module.exports = Model;
