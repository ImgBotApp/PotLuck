/**
 * Created by yazan on 5/16/2017.
 */

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

    app.get('/recipe/:id', isLoggedIn, (req, res) => {
        Recipe.findById(req.params.id, (err, recipe) => {
            if (err) console.log(err);
            res.render(path.resolve(_viewsdir + '/RecipeView/recipe.ejs'), {
                recipe: recipe,
                navbar: ['Home', 'Dashboard', 'Profile', 'Polling', 'About', 'Logout']
            });
        });
    });

    app.get('/get_suggestions', isLoggedIn, (req, res) => {
        const uRecipeArr = []; // Final result array (User liked recipes with appended similarities)
        const recipeIds = []; // Array of liked recipes by current user stored by their ObjectIds
        let i = 0;

        // Loop through user feedback array and collect positively rated recipes
        _.each(req.user.local.feedback, f => {
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
        }, {$sort: {_id: 1}}], (err, recipes) => {
            // Sort users liked recipes in ascending order to allow of O(n) time looping.
            recipeIds.sort((a, b) => a.toString().localeCompare(b.toString()));

            // Find similar recipes that match what the user liked. Similar recipes correspond to the id of the recipes
            // they are similar too.
            // TODO Use FindById to match recipes rather than manually looking it up (what is happening now)
            _.each(recipes, recipe => {
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
            const similarities = [];
            uRecipeArr[0].similarities[1].forEach((item, index) => {
                similarities[index] = item;
            });

            Recipe.find({
                '_id': {
                    $in: similarities
                }
            }, (err, docs) => {
                console.log(docs);

                // Return result to client
                res.writeHead(200, {"Content-Type": "application/json"});
                res.end(JSON.stringify(docs));
            })
        });
    });

    // Route for polling users on their food preferences
    app.get('/polling', isLoggedIn, (req, res) => {
        const version = req.query.version;

        // Collect single random recipe from the database, projecting only its id, title, and image
        // TODO To increase uniqueness of polling sample, increase sample size
        Recipe.aggregate({$sample: {size: 1}}, {$project: {_id: 1, title: 1, image: 1}}, (err, docs) => {
            if (err) console.log(err);
            if (version === 'v2') {
                res.setHeader('Content-Type', 'application/json');
                const target = {
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
    app.post('/polling', isLoggedIn, (req, res) => {
        User.findByIdAndUpdate(req.user._id, {$push: {"local.feedback": req.body}}, {
            safe: true,
            upsert: true,
            new: true
        }, err => {
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


