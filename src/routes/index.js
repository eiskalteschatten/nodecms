'use strict';

const express = require('express');
const router = express.Router();
//const cache = require('apicache').middleware;

const track = require('../lib/matomo');

router.get('/', async (req, res) => {
    track(req, 'Home');

    res.render('home/index.njk', {
        pageId: 'home'
    });
});

module.exports = router;
