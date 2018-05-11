'use strict';

const path = require('path');
const compileSass = require('compile-sass');
const concatenateJs = require('concatenate-js-middleware');

const cssConfig = require('../../config/css');
const jsConfig = require('../../config/javascripts');
const iAmHere = path.join(__dirname, '../../');

function setupCleanupOnExit(jsFiles) {
    process.on('SIGINT', () => {
        try {
            concatenateJs.setupCleanupOnExit({
                path: path.join(iAmHere, 'public/js/'),
                files: jsFiles
            });

            compileSass.setupCleanupOnExit(path.join(iAmHere, 'public/css/'));

            process.exit(0);
        }
        catch(error) {
            process.exit(1);
        }
    });
}

module.exports = app => {
    let jsFiles;

    if (app.get('env') === 'staging' || app.get('env') === 'production') {
        jsFiles = ['libs.js', 'scripts.js'];

        return concatenateJs.concatenateJsAndSaveMultiple({
            originPath: path.join(iAmHere, 'public/js/'),
            destinationPath: path.join(iAmHere, 'public/js/'),
            files: jsFiles,
            minify: true,
            config: jsConfig
        }).then(() => {
            return compileSass.compileSassAndSaveMultiple({
                sassPath: path.join(iAmHere, 'public/scss/'),
                cssPath: path.join(iAmHere, 'public/css/'),
                files: cssConfig.sassFilesToCompile
            });
        }).then(() => {
            setupCleanupOnExit(jsFiles);
            return app;
        }).catch(error => {
            throw new Error(error);
        });
    }
    else {
        // If not staging or production, just compile the libs.scss and libs.js
        jsFiles = ['libs.js'];

        return concatenateJs.concatenateJsAndSaveMultiple({
            originPath: path.join(iAmHere, 'public/js/'),
            destinationPath: path.join(iAmHere, 'public/js/'),
            files: jsFiles,
            minify: false,
            config: jsConfig
        }).then(() => {
            return compileSass.compileSassAndSaveMultiple({
                sassPath: path.join(iAmHere, 'public/scss/'),
                cssPath: path.join(iAmHere, 'public/css/'),
                files: ['libs.scss']
            });
        }).then(() => {
            app.use('/css/:cssName', compileSass({
                sassFilePath: path.join(iAmHere, 'public/scss/')
            }));

            app.use('/js/:jsName', concatenateJs({
                config: jsConfig
            }));

            setupCleanupOnExit(jsFiles);

            return app;
        }).catch(error => {
            throw new Error(error);
        });
    }
};
