'use strict';

const express = require('express');
const router = express.Router();

const errorHandling = require('../../lib/errorHandling');
const helper = require('../../lib/helper');

const User = require('../../models/User');


router.get('/', async (req, res) => {
    const pageTitle = 'Users';
    const limit = 10;
    const page = req.query.page || 0;

    try {
        const users = await User.find().sort({lastName: 'asc'}).skip(page * limit).limit(limit).exec();
        const count = await User.find().count().exec();
        const numberOfPages = Math.ceil(count / limit);

        res.render('dashboard/users/index.njk', {
            pageTitle: pageTitle,
            pageId: pageTitle.toLowerCase(),
            users: users,
            numberOfPages: numberOfPages,
            page: page,
            previousPage: helper.calculatePreviousPage(page),
            nextPage: helper.calculateNextPage(page, numberOfPages),
            breadcrumbs: {
                '/dashboard/users': pageTitle
            }
        });
    }
    catch(error) {
        errorHandling.returnError(error, res, req);
    }
});


router.get('/new', async (req, res) => {
    const pageTitle = 'Add New User';

    res.render('dashboard/users/new.njk', {
        pageTitle: pageTitle,
        pageId: pageTitle.toLowerCase(),
        flashMessage: req.flash('createUserMessage'),
        breadcrumbs: {
            '/dashboard/users': 'Users',
            '/dashboard/users/add': 'Add New User'
        }
    });
});


router.post('/new', async (req, res) => {
    const body = req.body;
    const userName = body.userName;
    const password = body.password;

    if (password !== body.repeatPassword) {
        req.flash('createUserMessage', 'The passwords do not match.');
        return res.redirect('/dashboard/users/new');
    }

    try {
        const user = await User.findOne({userName: userName}).exec();

        if (user) {
            req.flash('createUserMessage', `The username ${userName} is already taken.`);
            return res.redirect('/dashboard/users/new');
        }

        const newUser = new User({
            userName: userName,
            firstName: body.firstName,
            lastName: body.lastName,
            emailAddress: body.emailAddress,
            role: 'admin'
        });

        newUser.password = newUser.generateHash(password);

        await newUser.save();
        res.redirect(`/dashboard/users/edit/${userName}`);
    }
    catch(error) {
        errorHandling.returnError(error, res, req);
    }
});


router.get('/edit/:userName', async (req, res) => {
    const userName = req.params.userName;
    const pageTitle = `Edit user ${userName}`;

    const user = await User.findOne({userName: userName}).exec();

    const breadcrumbs = {
        '/dashboard/users': 'Users'
    };

    breadcrumbs[`/dashboard/users/edit/${userName}`] = pageTitle;

    res.render('dashboard/users/edit.njk', {
        pageTitle: pageTitle,
        pageId: pageTitle.toLowerCase(),
        user: user,
        breadcrumbs: breadcrumbs
    });
});


router.patch('/edit', async (req, res) => {
    const body = req.body;
    const setUser = {
        firstName: body.firstName,
        lastName: body.lastName,
        emailAddress: body.emailAddress
    };

    try {
        await User.findOneAndUpdate({userName: body.userName}, {$set: setUser}, {new: true}).exec();
        res.send('Changes saved successfully.');
    }
    catch(error) {
        errorHandling.returnError(error, res, req);
    }
});


router.patch('/edit/password/', async (req, res) => {
    const body = req.body;

    if (body.password === body.repeatPassword) {
        try {
            const user = await User.findOne({userName: body.userName}).exec();
            if (!user.validPassword(body.oldPassword)) {
                const newError = {
                    message: 'Your old password is incorrect.',
                    statusCode: 412
                };

                throw newError;
            }

            user.password = user.generateHash(body.password);

            await user.save();

            res.send('Changes saved successfully.');
        }
        catch(error) {
            errorHandling.returnError(error, res, req);
        }
    }
    else {
        res.status(412).send('Passwords do not match.');
    }
});


router.delete('/edit', async (req, res) => {
    try {
        await User.findOneAndRemove({userName: req.body.userName}).exec();
        res.send('ok');
    }
    catch(error) {
        errorHandling.returnError(error, res, req);
    }
});


module.exports = router;
