/**
 * Created by O on 10/21/2016.
 */
var path    = require('path');
var bcrypt  = require('bcrypt-nodejs');
var User    = require('../app/models/users');
var Recipe  = require('../app/models/recipes');
var mongoose     = require('mongoose');

module.exports = function(app, passport) {

    app.get('/', function(req, res) {
        res.render(path.resolve(__dirname + '../../views/Home/index.ejs'));
    });

    app.get('/login', function(req, res) {
        res.render(path.resolve(__dirname + '../../views/Login/login.ejs'), { message: req.flash('loginMessage') });
    });

    // process the login form
    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/dashboard', // redirect to the secure profile section
        failureRedirect : '/login', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    app.get('/signup', function(req, res) {
        // render the page and pass in any flash data if it exists
        res.render(path.resolve(__dirname + '../../views/Signup/signup.ejs'), { message: req.flash('signupMessage') });
    });

    // process the signup form
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/signup', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    app.get('/profile', isLoggedIn, function(req, res) {
        res.render(path.resolve(__dirname + '../../views/Profile/profile.ejs'), {
            user : req.user
        });
    });

    // route for facebook authentication and login
    app.get('/auth/facebook', passport.authenticate('facebook', { scope : 'email' }));

    // handle the callback after facebook has authenticated the user
    app.get('/auth/facebook/callback',
        passport.authenticate('facebook', {
            successRedirect : '/profile',
            failureRedirect : '/'
        }));

    // send to facebook to do the authentication
    app.get('/connect/facebook', passport.authorize('facebook', { scope : 'email' }));

    // handle the callback after facebook has authorized the user
    app.get('/connect/facebook/callback',
        passport.authorize('facebook', {
            successRedirect : '/profile',
            failureRedirect : '/'
        }));

    // facebook -------------------------------
    app.get('/unlink/facebook', function(req, res) {
        var user            = req.user;
        user.facebook.token = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

    app.get('/polling', isLoggedIn, function (req, res) {
        Recipe.aggregate({ $sample: { size: 1 } }, { $project: { _id: 1, title: 1, image: 1 } }, function (err, docs) {
            if (err) console.log(err);
            res.render(path.resolve(__dirname + '../../views/Polling/polling.ejs'), {
                user : req.user,
                recipe: docs
            });
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

    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });
};

function isLoggedIn(req, res, next) {

    if (req.isAuthenticated())
        return next();

    res.redirect('/');
}

/*function GetRandRecipes(callback) {

    var db = mongoose.connection;
    var collection = db.collection('recipes');
    collection.aggregate([
        {
            $sample: {
                size: 1
            }
        },
        {
            $project: {
                _id: 1,
                title: 1,
                image: 1
            }
        }
        ], function (err, docs) {
        if (err) console.log(err);
        console.log(docs);
    });
}*/

// generating a hash
function generateHash(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
}