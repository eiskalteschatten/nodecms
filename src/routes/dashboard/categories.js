'use strict';

const express = require('express');
const router = express.Router();

const errorHandling = require('../../lib/errorHandling');
const helper = require('../../lib/helper');

const Categories = require('../../models/Categories');

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
    await newCategory.save();
    res.redirect('/dashboard/categories');
  }
  catch(error) {
    errorHandling.returnError(error, res, req);
  }
});


// Use POST instead of PATCH because submitting a normal HTML form doesn't support method="patch"
router.post('/save', async (req, res) => {
  const body = req.body;
  const categoryName = body.categoryName;

  const setCategory = {
    name: categoryName,
    slug: helper.createSlug(categoryName),
    description: body.categoryDescription
  };

  try {
    await Categories.findOneAndUpdate({_id: body.id}, {$set: setCategory}, {new: true}).exec();
    res.redirect('/dashboard/categories');
  }
  catch(error) {
    errorHandling.returnError(error, res, req);
  }
});


router.delete('/', async (req, res) => {
  const body = req.body;

  try {
    await Categories.findOneAndRemove({_id: body.id}).exec();
    res.send('ok');
  }
  catch(error) {
    errorHandling.returnError(error, res, req);
  }
});


module.exports = router;
