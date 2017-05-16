/**
 * Created by O on 10/21/2016.
 */

var path = require('path'); // Require path module for configuring paths
var bcrypt = require('bcrypt-nodejs'); // Require our encryption algorithm
var fs = require('fs'); // Require module for interacting with file system
var Grid = require('gridfs-stream'); // Require module for streaming files to and from MongoDB GridFS
var User = require('../app/models/users'); // Require our user model
var Recipe = require('../app/models/recipes'); // Require of recipe model
var mongoose = require('mongoose'); // Require mongoose (used from GridFS connection)
var multer = require('multer'); // Require module for handling multipart form data (used for uploading files)
var upload = multer({dest: "./uploads"}); // Set upload location (destination)
var _ = require('underscore'); // Our JavaScript utility-belt (used for looping in our case)

var conn = mongoose.connection;
Grid.mongo = mongoose.mongo;
var gfs = Grid(conn.db);
const _viewsdir = appRoot+'/views/';

module.exports = function (app, passport) {


    // Our homepage
    app.get('/', function (req, res) {
        res.render(path.resolve(__dirname + '/../views/Home/intro.ejs')); // Render view
    });

    // Sign-in page/dashboard
    app.get('/index', function (req, res) {
        res.render(path.resolve(__dirname + '/../views/Home/index.ejs'), { // Render view with given options
            loggedin: req.user !== undefined, // Check if user is logged in and pass the result to the client
            user: req.user // Pass the user model to the client
        });
    });

    // TODO Solution currently only returns top three similarities of the first liked recipe the user rated. Need to
    // find way to get similarities of all recipes (Goal isn't currently clearly defined).
    app.get('/get_suggestions', isLoggedIn, function (req, res) {
        var uRecipeArr = [];
        var recipeIds = []; // Array of liked recipes by current user
        var sRecipeArr = [];
        var i = 0;

        // Loop through user feedback array and collect positively rated recipes
        _.each(req.user.local.feedback, function (f) {
            if (f.rating === 1) recipeIds[i++] = f.recipeId;
        });

        i = 0;

        // Collect sorted list of recipes, projecting only their ids, titles, images, cooking time, and similarities
        // array
        Recipe.aggregate([{
            $project: {
                _id: 1,
                title: 1,
                image: 1,
                readyInMinutes: 1,
                similarities: 1
            }
        }, {$sort: {_id: 1}}], function (err, recipes) {
            // Sort users liked recipes in ascending order to allow of O(n) time looping.
            recipeIds.sort(function (a, b) {
                return a.toString().localeCompare(b.toString());
            });

            // Find similar recipes that match what the user liked. Similar recipes correspond to the id of the recipes
            // they are similar too.
            _.each(recipes, function (recipe, index) {
                if (recipeIds[i] !== undefined) { // Poor way of checking if out of array bounds
                    if (recipe._id.toString() === recipeIds[i].toString()) {  // Found match?
                        uRecipeArr[i] = recipe; // Collect the recipe with its related recipe array
                        i++;
                    }
                }
            });
            // Query database for full information (metadata) on acquired similar recipes (Returns top 3 similarities
            // of first liked recipe. Temporary solution. Needs to be more intelligent)
            Recipe.find({
                '_id': {
                    $in: [
                        uRecipeArr[0].similarities[1][0].id,
                        uRecipeArr[0].similarities[1][1].id,
                        uRecipeArr[0].similarities[1][2].id
                    ]
                }
            }, function (err, docs) {
                console.log(docs);

                // Return result to client
                res.writeHead(200, {"Content-Type": "application/json"});
                res.end(JSON.stringify(docs));
            })
        });
    });

    // Our sign-in page
    app.get('/login', function (req, res) {
        // render the page and pass in any flash data if it exists
        res.render(path.resolve(__dirname + '/../views/Login/login.ejs'), {message: req.flash('loginMessage')});
    });

    // Process the login form
    app.post('/login', passport.authenticate('local-login', {
        successRedirect: '/polling', // redirect to the secure profile section
        failureRedirect: '/login', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));

    // Our sign-up page
    app.get('/signup', function (req, res) {
        // render the page and pass in any flash data if it exists
        res.render(path.resolve(__dirname + '/../views/Signup/signup.ejs'), {message: req.flash('signupMessage')});
    });

    // Process the signup form
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect: '/polling', // redirect to the secure profile section
        failureRedirect: '/signup', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));

    // Our profile page
    app.get('/profile', isLoggedIn, function (req, res) {
        var user_info = req.query.user_info; // Get url parameter value (Temporary testing parameter)

        // If value is 'true', return the skeleton of current user as JSON. Otherwise, render the user page
        if (user_info === "1") {
            User.findById(req.user._id, function (err, profile) {
                res.setHeader('Content-Type', 'application/json');
                res.send(JSON.stringify(profile, null, 3));
            });
        } else {
            res.render(path.resolve(__dirname + '/../views/Profile/profile.ejs'), {
                user: req.user
            });
        }
    });

    // Our algorithm for binding the similarities to the recipes they coorespond to
    // TODO Fix issue of duplicate similary binding on each run
    app.get('/similarities', isLoggedIn, function (req, res) {
        // Require password to prevent accidental use of route (temporary weak solution)
        if (req.query.password === "recsys2016") {
            // Collected recipes, projecting the results by their ids
            Recipe.aggregate([{$project: {_id: 1}}], function (err, recipes) {
                // Read similarities JSON file
                fs.readFile(__dirname + '/experimental/sims_test.json', 'utf8', function (err, data) {
                    if (err) console.log(err); // Log any errors out to the console

                    var obj = JSON.parse(data); // Parse JSON data as JavaScript object

                    // Sort parsed similarities file for efficient looping.
                    obj.sort(function (a, b) {
                        return a._id.localeCompare(b._id);
                    });

                    // Link each recipe with its corresponding list of related recipes
                    obj.forEach(function (similarity) {
                        _.each(recipes, function (recipe, index) {
                            if (similarity._id === recipe._id.toString()) {
                                Recipe.findByIdAndUpdate(recipe._id, {$push: {'similarities': similarity.similarities}}, {
                                    safe: true,
                                    upsert: true,
                                    sort: {_id: 1},
                                    new: true
                                }, function (err) {
                                    if (err) return console.log(err);
                                });
                            }
                        });
                    });
                });
            });
        } else {
            res.send("You are no allowed here.");
        }
        /*User.findById(req.user._id, function (err, user) {
         User.aggregate([
         {
         $match: {
         'local.feedback.rating': 1
         }
         },
         {
         $project: {
         'local.feedback': {
         $filter: {
         input: '$local.feedback',
         as: 'f',
         cond: {
         $eq: ['$$f.rating', 1]
         }
         }
         }, _id: user._id
         }
         }
         ], function (err, docs) {
         if (err) console.log(err);
         docs[0].local.feedback.sort(function (a, b) {
         return a.recipeId.toString().localeCompare(b.recipeId.toString());
         });
         fs.readFile(__dirname + '/experimental/sims.json', 'utf8', function (err, data) {
         if (err) console.log(err);
         var obj = JSON.parse(data);
         obj.sort(function (a, b) {
         return a._id.localeCompare(b._id);
         });
         var i = 0;
         obj.forEach(function (similarity) {
         docs[0].local.feedback.forEach(function (feedback) {
         if (similarity._id === feedback.recipeId.toString()) {
         User.update(
         {_id: req.user._id, 'local.feedback.recipeId': feedback.recipeId},
         {
         $push: {
         'local.feedback.$.similarities': obj[i].similarities
         }
         }
         , function (err) {
         if (err) console.log(err);
         else console.log("Success");
         })
         }
         });
         });
         res.render(path.resolve(__dirname + '/../views/Profile/mySuggestions.ejs'), {
         user: req.user
         });
         });
         });
         });*/
    });

    // Displays list of registered users (for testing purposes)
    app.get('/user_list', isLoggedIn, function (req, res) {
        var xport = req.query.export;
        var userMap = {};
        var i = 0;
        if (xport) {
            User.find({}, {$project: {_id: 1, title: 1, image: 1}}, function (err, user) {

            })
        } else {
            User.find({}, function (err, user) {
                user.forEach(function (user) {
                    userMap[i++] = user;
                });
                res.setHeader('Content-Type', 'application/json');
                console.log(userMap);
                res.send(JSON.stringify(userMap, null, 3));
            })
        }
    });

    // Displays random recipe from the database (for testing purposes)
    app.get('/rand_recipe', function (req, res) {
        Recipe.aggregate({$sample: {size: 1}}, function (err, docs) {
            if (err) console.log(err);
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify(docs, null, 3));
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
    app.get('/connect/local', function (req, res) {
        res.render(path.resolve(__dirname + '/../views/Login/connect-local.ejs'), {message: req.flash('loginMessage')});
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
    app.get('/unlink/local', function (req, res) {
        var user = req.user;
        user.local.password = undefined;
        user.local.email = undefined;
        user.save(function (err) {
            res.redirect('/profile');
        });
    });

    // Unlink facebook account
    app.get('/unlink/facebook', function (req, res) {
        var user = req.user;
        user.facebook.token = undefined;
        user.save(function (err) {
            res.redirect('/profile');
        });
    });

    // Unlink twitter account
    app.get('/unlink/twitter', function (req, res) {
        var user = req.user;
        user.twitter.token = undefined;
        user.save(function (err) {
            res.redirect('/profile');
        });
    });

    // Unlink google account
    app.get('/unlink/google', function (req, res) {
        var user = req.user;
        user.google.token = undefined;
        user.save(function (err) {
            res.redirect('/profile');
        });
    });

    // Unlink github account
    app.get('/unlink/github', function (req, res) {
        var user = req.user;
        user.github.id = undefined;
        user.save(function (err) {
            res.redirect('/profile');
        });
    });

    // Route for polling users on their food preferences
    app.get('/polling', isLoggedIn, function (req, res) {
        var version = req.query.version;

        // Collect single random recipe from the database, projecting only its id, title, and image
        // TODO To increase uniqueness of polling sample, increase sample size
        Recipe.aggregate({$sample: {size: 1}}, {$project: {_id: 1, title: 1, image: 1}}, function (err, docs) {
            if (err) console.log(err);
            if (version === 'v2') {
                res.setHeader('Content-Type', 'application/json');
                var target = {
                    "_id": docs[0]._id,
                    "title": docs[0].title,
                    "image": docs[0].image
                };
                console.log(target);
                res.send(JSON.stringify(target, null, 3));
            } else {
                res.render(path.resolve(__dirname + '/../views/Polling/polling.ejs'), {
                    user: req.user,
                    recipe: docs
                });
            }
        });
    });

    // Process user feedback results
    app.post('/polling', isLoggedIn, function (req, res) {
        User.findByIdAndUpdate(req.user._id, {$push: {"local.feedback": req.body}}, {
            safe: true,
            upsert: true,
            new: true
        }, function (err) {
            if (err) return console.log(err);

            res.redirect('/polling');
        });
    });

    // Process user form submission
    app.post('/profile', isLoggedIn, function (req, res) {
        var email = req.body.email;
        var name = req.body.name;
        if (req.body.pass > 0) {
            var password = generateHash(req.body.pass);

            var target = {
                "local.email": email,
                "local.name": name,
                "local.password": password
            };
        }
        target = {
            "local.email": email,
            "local.name": name
        };

        User.findByIdAndUpdate(req.user._id, {$set: target}, {new: true}, function (err) {
            if (err) return console.log(err);
            console.log(target);
            console.log(req.user._id);
        });

        res.redirect('/profile');
    });

    // Route for privacy page
    app.get('/privacy_policy', function (req, res) {
        res.render(path.resolve(__dirname + '/../views/Privacy/privacy.ejs'));
    });

    // Route for terms page
    app.get('/terms', function (req, res) {
        res.render(path.resolve(__dirname + '/../views/Terms/terms.ejs'));
    });

    // Route for ending session
    app.get('/logout', function (req, res) {
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