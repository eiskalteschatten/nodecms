'use strict';

const slug = require('slug');
const moment = require('moment');

module.exports = {
    parseRoute,
    createSlug,
    formatDate
};

function parseRoute(origRoute) {
    const route = origRoute.split('/');
    route.splice(0, 2);
    return route.join('/');
}

function createSlug(value) {
    return slug(value).replace( /([a-z])([A-Z])/g, '$1-$2' ).toLowerCase();
}

function formatDate(date, formatType) {
    return moment(date).locale('en-GB').format(formatType);
}
