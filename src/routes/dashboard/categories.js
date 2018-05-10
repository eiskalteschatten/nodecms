'use strict';

const express = require('express');
const router = express.Router();

const errorHandling = require('../../lib/errorHandling');
const helper = require('../../lib/helper');

const Categories = require('../../models/Categories');

const slug = require('slug');
const path = require('path');
const fs = require('fs');


router.get('/', async (req, res) => {
  const pageTitle = 'Categories';

  try {
    const categories = await Categories.find({}).exec();

    res.render('dashboard/categories/index.njk', {
      pageTitle: pageTitle,
      pageId: pageTitle.toLowerCase(),
      categories: categories,
      breadcrumbs: {
        '/dashboard/categories': pageTitle
      }
    });
  }
  catch(error) {
    errorHandling.returnError(error, res, req);
  }
});


router.post('/', async (req, res) => {
  const body = req.body;
  const categoryName = body.categoryName;

  const newCategory = new Categories({
    name: categoryName,
    slug: helper.createSlug(categoryName),
    description: body.categoryDescription
  });

  try {
    newCategory.save();
    res.redirect('/dashboard/categories');
  }
  catch(error) {
    errorHandling.returnError(error, res, req);
  }
});


router.patch('/', (req, res) => {
  const body = req.body;
  const organizationId = req.session.organizationId;
  const languages = req.session.settings.languages;
  const newCategoryNames = {};
  const newCategorySlugs = {};
  const newCategoryDescriptions = {};
  let category;

  languages.forEach(language => {
    newCategoryNames[language] = body[language + 'Name'];
    newCategorySlugs[language] = slug(body[language + 'Name']).toLowerCase();
    newCategoryDescriptions[language] = body[language + 'Description'];
  });

  const setCategory = {
    name: newCategoryNames,
    slug: newCategorySlugs,
    description: newCategoryDescriptions,
    organizationId: organizationId
  };

  Categories.findOneAndUpdate({_id: body.id, organizationId: organizationId}, {$set: setCategory}, {new: true}).exec().then(savedCategory => {
    category = savedCategory;
    return new Promise((resolve, reject) => {
      fs.readFile(path.join(__dirname, '../../views/blog/components/categoryRow.njk'), 'utf8', (error, template) => {
        if (error) {
          return reject(error);
        }

        resolve(template);
      });
    });
  }).then(template => {
    const response = {
      message: 'changesSavedSuccessfully',
      object: {
        category: category,
        template: template,
        actionType: 'replace',
        languages: req.session.settings.languages
      },
      callback: true
    };

    res.send(response);
  }).catch(error => {
    errorHandling.returnError(error, res, req);
  });
});


router.delete('/', (req, res) => {
  const body = req.body;
  const organizationId = req.session.organizationId;

  Categories.findOneAndRemove({_id: body.id, organizationId: organizationId}).exec().then(() => {
    const response = {
      message: 'changesSavedSuccessfully',
      object: {
        id: body.id,
        actionType: 'delete',
        languages: req.session.settings.languages
      },
      callback: true
    };

    res.send(response);
  }).catch(error => {
    errorHandling.returnError(error, res, req);
  });
});


module.exports = router;
