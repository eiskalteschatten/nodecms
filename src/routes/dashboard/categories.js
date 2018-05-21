'use strict';

const express = require('express');
const router = express.Router();

const errorHandling = require('../../lib/errorHandling');
const helper = require('../../lib/helper');

const Categories = require('../../models/Categories');

router.get('/', async (req, res) => {
    const pageTitle = 'Categories';
    const limit = 10;
    const page = req.query.page || 0;
    const search = req.query.search;
    let categories;
    let count;

    try {
        if (search) {
            const categoriesObj = await Categories.searchCategories(search);
            categories = categoriesObj.categories;
        }
        else {
            categories = await Categories.find().skip(page * limit).limit(limit).exec();
            count = await Categories.find().count().exec();
        }
        const numberOfPages = Math.ceil(count / limit);

        res.render('dashboard/categories/index.njk', {
            pageTitle: pageTitle,
            pageId: pageTitle.toLowerCase(),
            categories: categories,
            numberOfPages: numberOfPages,
            page: page,
            previousPage: helper.calculatePreviousPage(page),
            nextPage: helper.calculateNextPage(page, numberOfPages),
            search: search,
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
    const slug = helper.createSlug(categoryName);

    try {
        const category = await Categories.findOne({slug: slug}).exec();

        if (category) {
            return errorHandling.returnError({
                statusCode: 409,
                message: 'A category with that name already exists. Please choose a new name.'
            }, res, req);
        }

        const newCategory = new Categories({
            name: categoryName,
            slug: slug,
            description: body.categoryDescription
        });

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
    try {
        await Categories.findOneAndRemove({_id: req.body.id}).exec();
        res.send('ok');
    }
    catch(error) {
        errorHandling.returnError(error, res, req);
    }
});


module.exports = router;
