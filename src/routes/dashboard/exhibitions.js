'use strict';

const express = require('express');
const router = express.Router();
// const cache = require('apicache').middleware;
const marked = require('marked');

const errorHandling = require('../../lib/errorHandling');
const helper = require('../../lib/helper');

const Exhibition = require('../../models/Exhibition');

router.get('/', async (req, res) => {
  const pageTitle = 'Exhibitions';
  const limit = 10;
  const page = req.query.page || 0;

  try {
    const count = await Exhibition.count().exec();
    const exhibitions = await Exhibition.find().sort({updatedAt: 'desc'}).skip(page * limit).limit(limit).exec();
    const numberOfPages = Math.ceil(count / limit);

    res.render('dashboard/exhibitions/index.njk', {
      pageTitle: pageTitle,
      pageId: pageTitle.toLowerCase(),
      exhibitions: exhibitions,
      numberOfPages: numberOfPages,
      page: page,
      previousPage: page > 0 ? parseInt(page) - 1 : 0,
      nextPage: page < (numberOfPages - 1) ? parseInt(page) + 1 : 0,
      breadcrumbs: {
        '/dashboard/exhibitions': pageTitle
      }
    });
  }
  catch(error) {
    errorHandling.returnError(error, res, req);
  }
});


router.get('/new', (req, res) => {
  const pageTitle = 'Create New Exhibition';

  res.render('dashboard/exhibitions/edit.njk', {
    pageTitle: pageTitle,
    pageId: 'newExhibition',
    breadcrumbs: {
      '/dashboard/exhibitions': 'Exhibitions',
      '/dashboard/exhibitions/new': pageTitle,
    }
  });
});


router.get('/new/exhibition-template', (req, res) => {
  const id = req.query.id;

  res.render(`dashboard/exhibitions/templates/${id}.njk`, {}, (error, html) => {
    return error ? res.status(404).send(error) : res.send(html);
  });
});


router.get('/edit/:slug', async (req, res) => {
  const slug = req.params.slug;

  try {
    const exhibition = await Exhibition.findOne({slug: slug}).exec();

    if (!exhibition) {
      return errorHandling.returnError({
        statusCode: 404,
        message: 'Exhibition not found'
      }, res, req);
    }

    const pageTitle = `Edit "${exhibition.name}"`;
    const breadcrumbs = {
      '/dashboard/exhibitions': 'Exhibitions'
    };

    breadcrumbs[`/dashboard/exhibitions/edit/${slug}`] = pageTitle;

    res.render('dashboard/exhibitions/edit.njk', {
      pageTitle: pageTitle,
      pageId: 'editExhibition',
      exhibition: exhibition,
      breadcrumbs: breadcrumbs
    });
  }
  catch(error) {
    errorHandling.returnError(error, res, req);
  }
});


router.post('/edit', async (req, res) => {
  const body = req.body;
  let exhibitionId = body.exhibitionId;
  const slug = helper.createSlug(body.name);
  const setExhibition = {
    name: body.name,
    description: body.description,
    template: body.templateId,
    texts: [],
    media: [],
    meta: [],
    lastEditedBy: req.user.userName
  };

  body.texts.forEach(text => {
    setExhibition.texts.push({
      markdown: text,
      html: marked(text)
    });
  });

  try {
    const exhibitionWithSlug = await Exhibition.findOne({slug: slug}).exec();

    if (exhibitionWithSlug) {
      return errorHandling.returnError({
        message: 'An exhibition with that name already exists. Please choose a new name.',
        statusCode: 409
      }, res, req);
    }

    let exhibition;

    if (exhibitionId) {
      exhibition = await Exhibition.findById(exhibitionId).exec();

      if (exhibition) {
        exhibition.set(setExhibition);
      }
    }

    if (!exhibition) {
      setExhibition.author = req.user.userName;
      exhibition = new Exhibition(setExhibition);
      exhibitionId = exhibition._id;
    }

    exhibition.slug = slug;

    await exhibition.save();

    res.json({
      exhibitionId: exhibitionId
    });
  }
  catch(error) {
    errorHandling.returnError(error, res, req);
  }
});

module.exports = router;
