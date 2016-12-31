/**
 * Created by O on 10/21/2016.
 */
var path    = require('path');
var bcrypt  = require('bcrypt-nodejs');
var fs = require('fs');
var Grid = require('gridfs-stream');
var User    = require('../app/models/users');
var Recipe  = require('../app/models/recipes');
var mongoose     = require('mongoose');
var multer = require('multer');
var upload = multer({dest: "./uploads"});

var conn = mongoose.connection;
Grid.mongo = mongoose.mongo;
var gfs = Grid(conn.db);

module.exports = function(app, passport) {

    app.get('/', function(req, res) {
        res.render(path.resolve(__dirname + '/../views/Home/index.ejs'));
    });

    app.get('/login', function(req, res) {
        res.render(path.resolve(__dirname + '/../views/Login/login.ejs'), { message: req.flash('loginMessage') });
    });

    // process the login form
    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/login', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    app.get('/signup', function(req, res) {
        // render the page and pass in any flash data if it exists
        res.render(path.resolve(__dirname + '/../views/Signup/signup.ejs'), { message: req.flash('signupMessage') });
    });

    // process the signup form
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/signup', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    app.get('/profile', isLoggedIn, function(req, res) {
        var user_info = req.params.user_info;

        if (user_info == 1) {

        } else {
            res.render(path.resolve(__dirname + '/../views/Profile/profile.ejs'), {
                user: req.user
            });
        }
    });

    // route for facebook authentication and login
    app.get('/auth/facebook', passport.authenticate('facebook', { scope : ['email', 'public_profile'] }));

    // handle the callback after facebook has authenticated the user
    app.get('/auth/facebook/callback',
        passport.authenticate('facebook', {
            successRedirect : '/profile',
            failureRedirect : '/'
        }));

    // route for twitter authentication and login
    app.get('/auth/twitter', passport.authenticate('twitter'));

    // handle the callback after twitter has authenticated the user
    app.get('/auth/twitter/callback',
        passport.authenticate('twitter', {
            successRedirect : '/profile',
            failureRedirect : '/'
        }));

    // route for google authentication and login
    app.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }));

    // the callback after google has authenticated the user
    app.get('/auth/google/callback',
        passport.authenticate('google', {
            successRedirect : '/profile',
            failureRedirect : '/'
        }));

    app.get('/auth/github', passport.authenticate('github', { scope: [ 'user' ] }));

    app.get('/auth/github/callback',
        passport.authenticate('github', {
            successRedirect: '/profile',
            failureRedirect: '/'
        }));

    // Authorizations - locally
    app.get('/connect/local', function(req, res) {
        res.render(path.resolve(__dirname + '/../views/Login/connect-local.ejs'), {message: req.flash('loginMessage')});
    });
    app.post('/connect/local', passport.authenticate('local-signup', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/connect/local', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    // send to facebook to do the authentication
    app.get('/connect/facebook', passport.authorize('facebook', { scope : 'email' }));

    // handle the callback after facebook has authorized the user
    app.get('/connect/facebook/callback',
        passport.authorize('facebook', {
            successRedirect : '/profile',
            failureRedirect : '/'
        }));

    // send to twitter to do the authentication
    app.get('/connect/twitter', passport.authorize('twitter', { scope : ['email', 'public_profile'] }));

    // handle the callback after twitter has authorized the user
    app.get('/connect/twitter/callback',
        passport.authorize('twitter', {
            successRedirect : '/profile',
            failureRedirect : '/'
        }));

    // send to google to do the authentication
    app.get('/connect/google', passport.authorize('google', { scope : ['profile', 'email'] }));

    // the callback after google has authorized the user
    app.get('/connect/google/callback',
        passport.authorize('google', {
            successRedirect : '/profile',
            failureRedirect : '/'
        }));

    // send to google to do the authentication
    app.get('/connect/github', passport.authorize('github', { scope : ['user'] }));

    // the callback after google has authorized the user
    app.get('/connect/github/callback',
        passport.authorize('github', {
            successRedirect : '/profile',
            failureRedirect : '/'
        }));

    app.get('/unlink/local', function(req, res) {
        var user            = req.user;
        user.local.password = undefined;
        user.local.email     = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

    // facebook -------------------------------
    app.get('/unlink/facebook', function(req, res) {
        var user            = req.user;
        user.facebook.token = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

    // twitter --------------------------------
    app.get('/unlink/twitter', function(req, res) {
        var user           = req.user;
        user.twitter.token = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

    // google ---------------------------------
    app.get('/unlink/google', function(req, res) {
        var user          = req.user;
        user.google.token = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

    // github ---------------------------------
    app.get('/unlink/github', function(req, res) {
        var user          = req.user;
        user.github.id = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

    app.get('/polling', isLoggedIn, function (req, res) {
        var version = req.query.version;

        Recipe.aggregate({ $sample: { size: 1 } }, { $project: { _id: 1, title: 1, image: 1 } }, function (err, docs) {
            if (err) console.log(err);
            console.log(version);
            if (version == 'v2') {
                res.setHeader('Content-Type', 'application/json');
                res.send(JSON.stringify(docs, null, 3));
            } else {
                res.render(path.resolve(__dirname + '/../views/Polling/polling.ejs'), {
                    user: req.user,
                    recipe: docs
                });
            }
        });
    });

    app.post('/polling', isLoggedIn, function (req, res) {
        User.findByIdAndUpdate(req.user._id, {$push: {"local.feedback": req.body}}, {new: true}, function (err) {
            if (err) return console.log(err);
        });
    });

    app.post('/profile', isLoggedIn, function (req, res) {

        var email = req.body.email;
        var name = req.body.name;
        var password = generateHash(req.body.pass);

        var target = {
            "local.email": email,
            "local.name": name,
            "local.password": password
        };

        User.findByIdAndUpdate(req.user._id, { $set: target}, { new: true }, function (err) {
            if (err) return console.log(err);
            console.log(target);
            console.log(req.user._id);
        });

        res.redirect('/profile');
    });

    app.get('/privacy_policy', function (req, res) {
        res.render(path.resolve(__dirname + '../../views/Privacy/privacy.ejs'));
    });

    app.get('/terms', function (req, res) {
        res.render(path.resolve(__dirname + '../../views/Terms/terms.ejs'));
    });

    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

    app.post('/profile/photo', isLoggedIn, upload.single('avatar'), function (req, res) {
        var writestream = gfs.createWriteStream({
            filename: req.file.originalname
        });
        fs.createReadStream('./uploads/' + req.file.filename)
            .on('end', function () {
                fs.unlink('./uploads/' + req.file.filename, function (err) {
                    res.redirect('/profile');
                })
            })
            .on('err', function () {
                res.send('Error uploading image')
            })
            .pipe(writestream);
        User.findByIdAndUpdate(req.user._id, {$set: {'local.picture': req.file.originalname}}, {new: true}, function (err) {
            if (err) return console.log(err);
        });
    });

    app.get('/profile/photo/:filename', isLoggedIn, function (req, res) {
        var readstream = gfs.createReadStream({filename: req.params.filename});
        readstream.on('error', function (err) {
            res.send('No image found with that title');
        });
        readstream.pipe(res);
    });

    app.get('/profile/photo/delete/:filename', isLoggedIn, function (req, res) {
        gfs.exist({filename: req.params.filename}, function (err, found) {
            if (err) return res.send('Error occured');
            if (found) {
                gfs.remove({filename: req.params.filename}, function (err) {
                    if (err) return res.send('Error occured');
                    User.findByIdAndUpdate(req.user._id, {$set: {'local.picture': undefined}}, {new: true}, function (err) {
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

function isLoggedIn(req, res, next) {

    if (req.isAuthenticated())
        return next();

    res.redirect('/');
}

// generating a hash
function generateHash(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
}