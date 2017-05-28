/**
 * Created by yazan on 5/16/2017.
 */

const _viewsdir = appRoot + '/views';
const _modelsdir = appRoot + '/app/models';

var _ = require('underscore'); // Our JavaScript utility-belt (used for looping in our case)
var path = require('path'); // Require path module for configuring paths
var bcrypt = require('bcrypt-nodejs'); // Require our encryption algorithm
var fs = require('fs'); // Require module for interacting with file system
var Grid = require('gridfs-stream'); // Require module for streaming files to and from MongoDB GridFS
var User = require(_modelsdir + '/users.js'); // Require our user model
var Recipe = require(_modelsdir + '/recipes.js'); // Require of recipe model
var mongoose = require('mongoose'); // Require mongoose (used from GridFS connection)
var multer = require('multer'); // Require module for handling multipart form data (used for uploading files)
var upload = multer({dest: "./uploads"}); // Set upload location (destination)
var conn = mongoose.connection;
Grid.mongo = mongoose.mongo;
var gfs = Grid(conn.db);


module.exports = function (app, passport) {

    app.get('/get_suggestions', isLoggedIn, function (req, res) {
        var uRecipeArr = []; // Final result array (User liked recipes with appended similarities)
        var recipeIds = []; // Array of liked recipes by current user stored by their ObjectIds
        var i = 0;

        // Loop through user feedback array and collect positively rated recipes
        _.each(req.user.local.feedback, function (f) {
            if (f.rating === 1) recipeIds[i++] = f.recipeId;
        });


        // Collect sorted list of recipes, projecting only their ids, titles, images, cooking time, and similarities
        // array
        Recipe.aggregate([{
            $project: {
                _id: 1,
                title: 1,
                image: 1,
                similarities: 1
            }
        }, {$sort: {_id: 1}}], function (err, recipes) {
            // Sort users liked recipes in ascending order to allow of O(n) time looping.
            recipeIds.sort(function (a, b) {
                return a.toString().localeCompare(b.toString());
            });

            // Find similar recipes that match what the user liked. Similar recipes correspond to the id of the recipes
            // they are similar too.
            // TODO Use FindById to match recipes rather than manually looking it up (what is happening now)
            _.each(recipes, function (recipe) {
                if (recipeIds[i] !== undefined) { // Poor way of checking if out of array bounds
                    if (recipe._id.toString() === recipeIds[i].toString()) {  // Found match?
                        uRecipeArr[i] = recipe; // Collect the recipe with its related recipe array
                        i++;
                    }
                }
            });
            // Query database for full information (metadata) on acquired similar recipes (Returns top 3 similarities
            // of first liked recipe. Temporary solution. Needs to be more intelligent)

            //get all the items from the similarities array
            var similarities = [];
            uRecipeArr[0].similarities[1].forEach(function (item, index) {
                similarities[index] = item;
            });

            Recipe.find({
                '_id': {
                    $in: similarities
                }
            }, function (err, docs) {
                console.log(docs);

                // Return result to client
                res.writeHead(200, {"Content-Type": "application/json"});
                res.end(JSON.stringify(docs));
            })
        });
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
                res.render(path.resolve(_viewsdir + '/Polling/polling.ejs'), {
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


