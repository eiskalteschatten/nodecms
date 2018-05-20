'use strict';

const express = require('express');
const router = express.Router();
//const cache = require('apicache').middleware;

router.get('/', async (req, res) => {
    res.render('home/index.njk', {
        pageId: 'home'
    });
});

module.exports = router;
