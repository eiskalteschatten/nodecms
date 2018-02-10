'use strict';

const config = require(`../../config/envs/${process.env.NODE_ENV}.json`).mongo;

const mongoose = require('mongoose');

mongoose.connect(`mongodb://${config.host}/${config.database}`);
mongoose.Promise = global.Promise;

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', () => {
  console.log('Connected to MongoDB');
});

module.exports = db;
