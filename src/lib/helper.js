'use strict';

const slug = require('slug');

module.exports = {
  parseRoute,
  createSlug
};

function parseRoute(origRoute) {
  const route = origRoute.split('/');
  route.splice(0, 2);
  return route.join('/');
}

function createSlug(value) {
  return slug(value).replace( /([a-z])([A-Z])/g, '$1-$2' ).toLowerCase();
}
