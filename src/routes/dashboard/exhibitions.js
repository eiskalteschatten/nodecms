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



  res.render('dashboard/exhibitions/index.njk', {
    pageTitle: pageTitle,
    pageId: pageTitle.toLowerCase(),
    breadcrumbs: {
      '/dashboard/exhibitions': pageTitle
    }
  });
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
