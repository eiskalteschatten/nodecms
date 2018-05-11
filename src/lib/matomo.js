'use strict';

const env = process.env.NODE_ENV;
const config = require(`../config/envs/${env}.json`);

const matomoTracker = require('matomo-tracker');
const matomoConfig = config.tracking.matomo;
let matomo;

if (env !== 'development') {
    matomo = new matomoTracker(matomoConfig.siteId, matomoConfig.url);

    matomo.on('error', error => {
        console.error('Error tracking request:', error);
    });
}

module.exports = (req, pageTitle) => {
    const url = req.protocol + '://' + req.get('host') + req.originalUrl;

    if (env !== 'production') {
        console.log('Tracked:', pageTitle, '-', url);
    }

    if (env !== 'development') {
        matomo.track({
            url: url,
            action_name: pageTitle
        });
    }
};
