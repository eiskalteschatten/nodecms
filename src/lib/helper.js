'use strict';

const slug = require('slug');
const moment = require('moment');

const uploadTypes = require('../config/uploadTypes');

module.exports = {
    parseRoute,
    createSlug,
    formatDate,
    getFileType,
    calculatePreviousPage,
    calculateNextPage
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

function getFileType(file) {
    const mimeTypes = uploadTypes.mimeTypes;
    const mimeType = file.mimetype || file.mimeType;
    const firstPartOfMimeType = mimeType.indexOf('/') > -1 ? mimeType.split('/')[0] : mimeType;

    if (mimeTypes[mimeType]) {
        return mimeTypes[mimeType].type;
    }
    else if (mimeTypes[firstPartOfMimeType]) {
        return mimeTypes[firstPartOfMimeType].type;
    }
    else {
        return 'other';
    }
}

function calculatePreviousPage(page) {
    return page > 0 ? parseInt(page) - 1 : 0;
}


function calculateNextPage(page, numberOfPages) {
    return page < (numberOfPages - 1) ? parseInt(page) + 1 : 0;
}
