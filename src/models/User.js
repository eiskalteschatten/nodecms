'use strict';

const mongoose = require('mongoose');
const db = require('../lib/mongo/connection');

const bcrypt = require('bcrypt-nodejs');

const modelName = 'User';

const schema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    userName: String,
    emailAddress: String,
    password: String,
    role: String
},
{
    collection: 'users',
    versionKey: false,
    timestamps: true
});

schema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

schema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
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
