'use strict';

const express = require('express');
const router = express.Router();
const cache = require('apicache').middleware;

router.get('/', cache('1 minute'), async (req, res) => {
    res.render('home/index.njk', {
        pageId: 'home'
    });
});

module.exports = router;
