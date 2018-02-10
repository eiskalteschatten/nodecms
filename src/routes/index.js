'use strict';

const express = require('express');
const router = express.Router();
//const cache = require('apicache').middleware;

const transLib = require('../lib/translate');
const translate = transLib.translate;

router.get('/', (req, res) => {
  const lang = req.lang;
  const locals = req.app.locals;
  const pageTitle = translate(lang, 'homepageTitle', locals);

  res.render('home/index.njk', {
    title: pageTitle,
    items: [
      { name : translate(lang, 'homepageTitle', locals) },
      { name : lang },
      { name : 'item #3' },
      { name : 'item #4' }
    ]
  });
});

module.exports = router;
