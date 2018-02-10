'use strict';

const tempApiAuth = require('../../models/TempApiAuth');
const uuid = require('uuid');

module.exports = {
  createNewTempToken,
  checkIfTokenIsValid
};

function createNewTempToken() {
  return new Promise((resolve, reject) => {
    const authToken = uuid.v4().toUpperCase();

    // Make the auth token valid for an hour
    const validUntil = new Date();
    validUntil.setHours(validUntil.getHours() + 1);

    tempApiAuth.create(({token: authToken, validUntil: validUntil}), error => {
      if (error) {
        reject(new Error(error));
      }

      resolve(authToken);
    });
  });
}

function checkIfTokenIsValid(token) {
  return new Promise((resolve, reject) => {
    tempApiAuth.find({token: token}, (error, result) => {
      if (error) {
        reject(new Error(error));
      }

      const now = new Date();

      if (!result || result.length === 0 || now > result[0].validUntil) {
        reject(401);
      }

      resolve();
    });
  });
}
