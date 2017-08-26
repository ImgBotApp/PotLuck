/**
 * Created by yazan on 5/16/2017.
 */
'use strict';

const _viewsdir = appRoot + '/views';
const _modelsdir = appRoot + '/app/models';

const _ = require('underscore'); // Our JavaScript utility-belt (used for looping in our case)
const path = require('path'); // Require path module for configuring paths
const bcrypt = require('bcrypt-nodejs'); // Require our encryption algorithm
const fs = require('fs'); // Require module for interacting with file system
const Grid = require('gridfs-stream'); // Require module for streaming files to and from MongoDB GridFS
const User = require(_modelsdir + '/users.js').User; // Require our user model
const Recipe = require(_modelsdir + '/recipes.js').Recipe; // Require of recipe model
const mongoose = require('mongoose'); // Require mongoose (used from GridFS connection)
const multer = require('multer'); // Require module for handling multipart form data (used for uploading files)
const upload = multer({dest: "./uploads"}); // Set upload location (destination)
const conn = mongoose.connection;
Grid.mongo = mongoose.mongo;
const gfs = Grid(conn.db);


module.exports = (app, passport) => {

    // Our sign-in page
    app.get('/login', (req, res) => {
        // render the page and pass in any flash data if it exists
        res.render(path.resolve(_viewsdir + '/Login/login.ejs'), {message: req.flash('loginMessage')});
    });

    // Process the login form
    app.post('/login', passport.authenticate('local-login', {
        successRedirect: '/polling', // redirect to the secure profile section
        failureRedirect: '/login', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));

    // Our sign-up page
    app.get('/signup', (req, res) => {
        // render the page and pass in any flash data if it exists
        res.render(path.resolve(_viewsdir + '/Signup/signup.ejs'), {message: req.flash('signupMessage')});
    });


    // Process the signup form
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect: '/polling', // redirect to the secure profile section
        failureRedirect: '/signup', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));


    // Our profile page
    app.get('/profile', isLoggedIn, (req, res) => {
        const user_info = req.query.user_info; // Get url parameter value (Temporary testing parameter)

        // If value is 'true', return the skeleton of current user as JSON. Otherwise, render the user page
        if (user_info === "1") {
            User.findById(req.user._id, (err, profile) => {
                res.setHeader('Content-Type', 'application/json');
                res.send(JSON.stringify(profile, null, 3));
            });
        } else {
            res.render(path.resolve(_viewsdir + '/Profile/profile.ejs'), {
                user: req.user
            });
        }
    });


    // route for facebook authentication and login
    app.get('/auth/facebook', passport.authenticate('facebook', {scope: ['email', 'public_profile']}));

    // handle the callback after facebook has authenticated the user
    app.get('/auth/facebook/callback',
        passport.authenticate('facebook', {
            successRedirect: '/profile',
            failureRedirect: '/'
        }));

    // route for twitter authentication and login
    app.get('/auth/twitter', passport.authenticate('twitter'));

    // handle the callback after twitter has authenticated the user
    app.get('/auth/twitter/callback',
        passport.authenticate('twitter', {
            successRedirect: '/profile',
            failureRedirect: '/'
        }));

    // route for google authentication and login
    app.get('/auth/google', passport.authenticate('google', {scope: ['profile', 'email']}));

    // the callback after google has authenticated the user
    app.get('/auth/google/callback',
        passport.authenticate('google', {
            successRedirect: '/profile',
            failureRedirect: '/'
        }));

    // route for github authentication and login
    app.get('/auth/github', passport.authenticate('github', {scope: ['user']}));

    // the callback after github has authenticated the user
    app.get('/auth/github/callback',
        passport.authenticate('github', {
            successRedirect: '/profile',
            failureRedirect: '/'
        }));

    // Create a local account if previously set-up external account
    app.get('/connect/local', (req, res) => {
        res.render(path.resolve(_viewsdir + '/Login/connect-local.ejs'), {message: req.flash('loginMessage')});
    });

    // Process local account creation
    app.post('/connect/local', passport.authenticate('local-signup', {
        successRedirect: '/profile', // redirect to the secure profile section
        failureRedirect: '/connect/local', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));

    // send to facebook to do the authentication
    app.get('/connect/facebook', passport.authorize('facebook', {scope: 'email'}));

    // handle the callback after facebook has authorized the user
    app.get('/connect/facebook/callback',
        passport.authorize('facebook', {
            successRedirect: '/profile',
            failureRedirect: '/'
        }));

    // send to twitter to do the authentication
    app.get('/connect/twitter', passport.authorize('twitter', {scope: ['email', 'public_profile']}));

    // handle the callback after twitter has authorized the user
    app.get('/connect/twitter/callback',
        passport.authorize('twitter', {
            successRedirect: '/profile',
            failureRedirect: '/'
        }));

    // send to google to do the authentication
    app.get('/connect/google', passport.authorize('google', {scope: ['profile', 'email']}));

    // the callback after google has authorized the user
    app.get('/connect/google/callback',
        passport.authorize('google', {
            successRedirect: '/profile',
            failureRedirect: '/'
        }));

    // send to google to do the authentication
    app.get('/connect/github', passport.authorize('github', {scope: ['user']}));

    // the callback after google has authorized the user
    app.get('/connect/github/callback',
        passport.authorize('github', {
            successRedirect: '/profile',
            failureRedirect: '/'
        }));

    // Unlink local account
    app.get('/unlink/local', (req, res) => {
        const user = req.user;
        user.local.password = undefined;
        user.local.email = undefined;
        user.save(err => {
            res.redirect('/profile');
        });
    });

    // Unlink facebook account
    app.get('/unlink/facebook', (req, res) => {
        const user = req.user;
        user.facebook.token = undefined;
        user.save(err => {
            res.redirect('/profile');
        });
    });

    // Unlink twitter account
    app.get('/unlink/twitter', (req, res) => {
        const user = req.user;
        user.twitter.token = undefined;
        user.save(err => {
            res.redirect('/profile');
        });
    });

    // Unlink google account
    app.get('/unlink/google', (req, res) => {
        const user = req.user;
        user.google.token = undefined;
        user.save(err => {
            res.redirect('/profile');
        });
    });

    // Unlink github account
    app.get('/unlink/github', (req, res) => {
        const user = req.user;
        user.github.id = undefined;
        user.save(err => {
            res.redirect('/profile');
        });
    });


    // Process user form submission
    app.post('/profile', isLoggedIn, (req, res) => {
        let target;
        const email = req.body.email;
        const name = req.body.name;
        if (req.body.pass > 0) {
            const password = generateHash(req.body.pass);

            target = {
                "local.email": email,
                "local.name": name,
                "local.password": password
            };
        }
        target = {
            "local.email": email,
            "local.name": name
        };

        User.findByIdAndUpdate(req.user._id, {$set: target}, {new: true}, err => {
            if (err) return console.log(err);
            console.log(target);
            console.log(req.user._id);
        });

        res.redirect('/profile');
    });


    // Route for ending session
    app.get('/logout', (req, res) => {
        req.logout();
        res.redirect('/');
    });


    app.post('/profile/photo', isLoggedIn, upload.single('avatar'), (req, res) => {
        const writestream = gfs.createWriteStream({
            filename: req.file.originalname
        });
        fs.createReadStream('./uploads/' + req.file.filename)
            .on('end', () => {
                fs.unlink('./uploads/' + req.file.filename, err => {
                    res.redirect('/profile');
                })
            })
            .on('err', () => {
                res.send('Error uploading image')
            })
            .pipe(writestream);
        User.findByIdAndUpdate(req.user._id, {$set: {'local.picture': req.file.originalname}}, {new: true}, err => {
            if (err) return console.log(err);
        });
    });

    app.get('/profile/photo/:filename', isLoggedIn, (req, res) => {
        const readstream = gfs.createReadStream({filename: req.params.filename});
        readstream.on('error', err => {
            res.send('No image found with that title');
        });
        readstream.pipe(res);
    });

    app.get('/profile/photo/delete/:filename', isLoggedIn, (req, res) => {
        gfs.exist({filename: req.params.filename}, (err, found) => {
            if (err) return res.send('Error occured');
            if (found) {
                gfs.remove({filename: req.params.filename}, err => {
                    if (err) return res.send('Error occured');
                    User.findByIdAndUpdate(req.user._id, {$set: {'local.picture': undefined}}, {new: true}, err => {
                        if (err) return console.log(err);
                    });
                    res.redirect('/profile');
                });
            } else {
                res.send('No image found with that title');
            }
        });
    });


};


/**
 * Function for checking if the user requesting the page is logged in
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
function isLoggedIn(req, res, next) {

    if (req.isAuthenticated())
        return next();

    res.redirect('/');
}

/**
 * Function for generating a hash
 * @param password Password to be hashed
 * @returns {*} Encrypted password
 */
function generateHash(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
}
