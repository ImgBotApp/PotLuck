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

    /*********************************/
    /**      ACCOUNT MANAGEMENT     **/
    /*********************************/

    // route for facebook authentication and login
    app.get('/auth/facebook', loginExternal(passport, 'facebook', {scope: ['email', 'public_profile']}, 'authenticate'));

    // handle the callback after facebook has authenticated the user
    app.get('/auth/facebook/callback', loginExternalCB(passport, 'authenticate'), isFirstVisit);

    // route for twitter authentication and login
    app.get('/auth/twitter', loginExternal(passport, 'twitter', null, 'authenticate'));

    // handle the callback after twitter has authenticated the user
    app.get('/auth/twitter/callback', loginExternalCB(passport, 'authenticate'), isFirstVisit);

    // route for google authentication and login
    app.get('/auth/google', loginExternal(passport, 'google', {scope: ['profile', 'email']}, 'authenticate'));

    // the callback after google has authenticated the user
    app.get('/auth/google/callback', loginExternalCB(passport, 'authenticate'), isFirstVisit);

    // route for github authentication and login
    app.get('/auth/github', loginExternal(passport, 'github', {scope: ['user']}, 'authenticate'));

    // the callback after github has authenticated the user
    app.get('/auth/github/callback', loginExternalCB(passport, 'authenticate'), isFirstVisit);

    app.get('/auth/linkedin', loginExternal(passport, 'linkedin', {scope: ['r_basicprofile', 'r_emailaddress']}, 'authenticate'));

    app.get('/auth/linkedin/callback', loginExternalCB(passport, 'authenticate'), isFirstVisit);

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
    app.get('/connect/facebook', loginExternal(passport, 'facebook', {scope: 'email'}, 'authorize'));

    // handle the callback after facebook has authorized the user
    app.get('/connect/facebook/callback', loginExternalCB(passport, 'authorize'));

    // send to twitter to do the authentication
    app.get('/connect/twitter', loginExternal(passport, 'twitter', {scope: ['email', 'public_profile']}, 'authorize'));

    // handle the callback after twitter has authorized the user
    app.get('/connect/twitter/callback', loginExternalCB(passport, 'authorize'));

    // send to google to do the authentication
    app.get('/connect/google', loginExternal(passport, 'google', {scope: ['profile', 'email']}, 'authorize'));

    // the callback after google has authorized the user
    app.get('/connect/google/callback', loginExternalCB(passport, 'authorize'));

    // send to google to do the authentication
    app.get('/connect/github', loginExternal(passport, 'github', {scope: ['user']}, 'authorize'));

    // the callback after google has authorized the user
    app.get('/connect/github/callback', loginExternalCB(passport, 'authorize'));

    app.get('/connect/linkedin', loginExternal(passport, 'linkedin', {scope: ['r_basicprofile', 'r_emailaddress']}, 'authorize'));

    app.get('/connect/linkedin/callback', loginExternalCB(passport, 'linkedin'));

    // Unlink local account
    app.delete('/unlink/local', (req, res) => unlinkAccount(req, res, 'local'));

    // Unlink facebook account
    app.delete('/unlink/facebook', (req, res) => unlinkAccount(req, res, 'facebook'));

    // Unlink twitter account
    app.delete('/unlink/twitter', (req, res) => unlinkAccount(req, res, 'twitter'));

    // Unlink google account
    app.delete('/unlink/google', (req, res) => unlinkAccount(req, res, 'google'));

    // Unlink github account
    app.delete('/unlink/github', (req, res) => unlinkAccount(req, res, 'github'));

    app.delete('/unlink/linkedin', (req, res) => unlinkAccount(req, res, 'linkedin'));
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

function unlinkAccount(req, res, account_name) {
    const user = req.user;
    if (user.connected_accounts < 2) {
        removeAccount(user._id, res);
        res.redirect('/');
    } else {
        user[account_name] = undefined;
        user.connected_accounts--;
        user.save(err => {
            if (err) console.log(err);
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({
                msg: toolbox.capitalizeFL(account_name) + ' account successfully un' + (account_name === 'linkedin' ? '\'linked\' (heh heh)' : 'linked'),
                connect_url: routes_list['connect_' + account_name].pathname,
                connect_alias: routes_list['connect_' + account_name].alias,
                btn_color: 'btn-primary',
                connected_accounts: user.connected_accounts
            }));
        });
    }
}

function loginExternal(passport, account_name, scope, method) {
    return function (req, res, next) {
        switch (method) {
            case 'authorize':
                passport.authorize(account_name, scope)(req, res, next);
                break;
            case 'authenticate':
                passport.authenticate(account_name, scope)(req, res, next);
                break;
        }
    };
}

function loginExternalCB(passport, method) {
    return function (req, res, next) {
        const account_name = req.originalUrl.split('/')[2];
        switch (method) {
            case 'authorize':
                passport.authorize(account_name, {
                    successRedirect: '/profile',
                    failureRedirect: '/'
                })(req, res, next);
                break;
            case 'authenticate':
                passport.authenticate(account_name, {failureRedirect: '/'})(req, res, next);
                break;
        }
    };
}

function isFirstVisit(req, res) {
    if (req.user.isFirstVisit)
        res.redirect('/polling');
    else
        res.redirect('/index');
}