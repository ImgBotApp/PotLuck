/**
 * Created by yazan on 5/16/2017.
 */
'use strict';

const _viewsdir = appRoot + '/views';
const _modelsdir = appRoot + '/app/models';

const path = require('path'); // Require path module for configuring paths
const bcrypt = require('bcrypt-nodejs'); // Require our encryption algorithm
const fs = require('fs'); // Require module for interacting with file system
const User = require(_modelsdir + '/users.js').User; // Require our user model
const multer = require('multer'); // Require module for handling multipart form data (used for uploading files)
const routes_list = require("../routes_list").routes_list; // List of routes to pass to EJS
const toolbox = require('../../toolbox/toolbox');
const upload = multer({dest: "./uploads"}); // Set upload location (destination)

let options = {routes: routes_list};

module.exports = (app, passport) => {

    // Our sign-in page
    app.get('/login', (req, res) => {
        if (req.user !== undefined) {
            res.redirect('/index');
        } else {
            // render the page and pass in any flash data if it exists
            options.message = req.flash('loginMessage');
            res.render(path.resolve(_viewsdir + '/Login/login.ejs'), options);
        }
    });

    // Process the login form
    app.post('/login', passport.authenticate('local-login', {
        failureRedirect: '/login', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }), isFirstVisit);

    // Route for ending session
    app.get('/logout', isLoggedIn, (req, res) => {
        req.logout();
        res.redirect('/');
    });

    // Our sign-up page
    app.get('/signup', (req, res) => {
        if (req.user !== undefined) {
            res.redirect('/index');
        } else {
            // render the page and pass in any flash data if it exists
            options.message = req.flash('signupMessage');
            res.render(path.resolve(_viewsdir + '/Signup/signup.ejs'), options);
        }
    });


    // Process the signup form
    app.post('/signup', passport.authenticate('local-signup', {
        failureRedirect: '/signup', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }), isFirstVisit);

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
            options.user = req.user;
            res.render(path.resolve(_viewsdir + '/Profile/profile.ejs'), options);
        }
    });

    // Process user form submission
    app.post('/profile', isLoggedIn, (req, res) => {
        let target = {};
        User.findById(req.user._id).lean().then(user => {
            target = user;
            const data = {
                name: {},
                email: {},
                password: {}
            };

            if (toolbox.validateName(req.body.name)) {
                target.local.name = toolbox.normalizeName(req.body.name);
                data.name.valid = true;
            } else
                data.name.valid = false;

            if (toolbox.validatePassword(req.body.pass)) {
                target.local.password = generateHash(req.body.pass);
                data.password.valid = true;
            } else
                data.password.valid = false;

            User.findOne({'local.email': req.body.email}).then(user => {
                if (toolbox.validateEmail(req.body.email) && !user) {
                    target.local.email = req.body.email;
                    data.email.valid = true;
                } else
                    data.email.valid = false;

                data.re = '/profile';

                User.findByIdAndUpdate(req.user._id, {$set: target}, {new: true}).then(user => {
                    data.name.is = user.local.name;
                    data.email.is = user.local.email;
                    res.writeHead(200, {'Content-Type': 'application/json'});
                    res.end(JSON.stringify(data));
                }).catch(err => console.log(err));
            }).catch(err => console.log(err));
        }).catch(err => console.log(err));
    });

    app.delete('/profile', isLoggedIn, (req, res) => {
        if (req.user.connected_accounts < 2)
            removeAccount(req.user._id, res);
        else {
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({msg: 'Please unlink all your accounts first before deletion.'}))
        }
    });

    app.post('/profile/photo', isLoggedIn, upload.single('avatar'), (req, res) => {
        const writestream = gfs.createWriteStream({
            filename: req.file.originalname
        });
        fs.createReadStream('./uploads/' + req.file.filename)
            .on('end', () => fs.unlink('./uploads/' + req.file.filename, err => res.redirect('/profile')))
            .on('err', () => res.send('Error uploading image'))
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
    app.get('/connect/local', isLoggedIn, (req, res) => {
        options.message = req.flash('loginMessage');
        res.render(path.resolve(_viewsdir + '/Login/connect-local.ejs'), options);
    });

    // Process local account creation
    app.post('/connect/local', isLoggedIn, passport.authenticate('local-signup', {
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
    app.delete('/unlink/local', (req, res) => {
        const user = req.user;
        if (user.connected_accounts < 2) {
            removeAccount(user._id, res);
            res.redirect('/');
        } else {
            user.local = undefined;
            user.connected_accounts--;
            user.save(err => {
                if (err) console.log(err);
                res.writeHead(200, {'Content-Type': 'application/json'});
                res.end(JSON.stringify({
                    msg: 'Local account successfully unlinked!',
                    connect_url: routes_list.connect_local.pathname,
                    connect_alias: routes_list.connect_local.alias,
                    btn_color: 'btn-default',
                    connected_accounts: user.connected_accounts
                }));
            });
        }
    });

    // Unlink facebook account
    app.delete('/unlink/facebook', (req, res) => {
        const user = req.user;
        if (user.connected_accounts < 2) {
            removeAccount(user._id, res);
            res.redirect('/');
        } else {
            user.facebook = undefined;
            user.connected_accounts--;
            user.save(err => {
                if (err) console.log(err);
                res.writeHead(200, {'Content-Type': 'application/json'});
                res.end(JSON.stringify({
                    msg: 'Facebook account successfully unlinked!',
                    connect_url: routes_list.connect_facebook.pathname,
                    connect_alias: routes_list.connect_facebook.alias,
                    btn_color: 'btn-primary',
                    connected_accounts: user.connected_accounts
                }));
            });
        }
    });

    // Unlink twitter account
    app.delete('/unlink/twitter', (req, res) => {
        const user = req.user;
        if (user.connected_accounts < 2) {
            removeAccount(user._id, res);
            res.redirect('/');
        } else {
            user.twitter = undefined;
            user.connected_accounts--;
            user.save(err => {
                if (err) console.log(err);
                res.writeHead(200, {'Content-Type': 'application/json'});
                res.end(JSON.stringify({
                    msg: 'Twitter account successfully unlinked!',
                    connect_url: routes_list.connect_twitter.pathname,
                    connect_alias: routes_list.connect_twitter.alias,
                    btn_color: 'btn-info',
                    connected_accounts: user.connected_accounts
                }));
            });
        }
    });

    // Unlink google account
    app.delete('/unlink/google', (req, res) => {
        const user = req.user;
        if (user.connected_accounts < 2) {
            removeAccount(user._id, res);
            res.redirect('/');
        } else {
            user.google = undefined;
            user.connected_accounts--;
            user.save(err => {
                if (err) console.log(err);
                res.writeHead(200, {'Content-Type': 'application/json'});
                res.end(JSON.stringify({
                    msg: 'Google account successfully unlinked!',
                    connect_url: routes_list.connect_google.pathname,
                    connect_alias: routes_list.connect_google.alias,
                    btn_color: 'btn-danger',
                    connected_accounts: user.connected_accounts
                }));
            });
        }
    });

    // Unlink github account
    app.delete('/unlink/github', (req, res) => {
            const user = req.user;
            if (user.connected_accounts < 2) {
                removeAccount(user._id, res);
                res.redirect('/');
            } else {
                user.github = undefined;
                user.connected_accounts--;
                user.save(err => {
                    if (err) console.log(err);
                    res.writeHead(200, {'Content-Type': 'application/json'});
                    res.end(JSON.stringify({
                        msg: 'GitHub successfully unlinked!',
                        connect_url: routes_list.connect_github.pathname,
                        connect_alias: routes_list.connect_github.alias,
                        btn_color: 'btn-default',
                        connected_accounts: user.connected_accounts
                    }));
                });
            }
        }
    );
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

/**
 * End user session and remove entry from database
 * @param _id
 * @param res
 */
function removeAccount(_id, res) {
    User.findByIdAndRemove(_id).then(() => {
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({
            msg: 'Account successfully deleted!',
            red: '/'
        }));
    }).catch(err => {
        if (err)
            console.log(err);
        res.writeHead(200, {'Content-Type': 'application/text'});
        res.end(JSON.stringify({
            msg: 'Sorry, we were not able to delete your account! Try again later.',
            red: '/'
        }));
    });
}

function isFirstVisit(req, res) {
    if (req.user.first_visit)
        res.redirect('/polling');
    else
        res.redirect('/index');
}