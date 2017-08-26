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
    // Our homepage
    app.get('/', (req, res) => {
        res.render(path.resolve(_viewsdir + '/Home/intro.ejs')); // Render view
    });

    // Sign-in page/dashboard
    app.get('/index', (req, res) => {
        res.render(path.resolve(_viewsdir + '/Home/index.ejs'), { // Render view with given options
            loggedin: req.user !== undefined, // Check if user is logged in and pass the result to the client
            user: req.user // Pass the user model to the client
        });
    });


    // Route for privacy page
    app.get('/privacy_policy', (req, res) => {
        res.render(path.resolve(_viewsdir + '/Privacy/privacy.ejs'));
    });

    // Route for terms page
    app.get('/terms', (req, res) => {
        res.render(path.resolve(_viewsdir + '/Terms/terms.ejs'));
    });


    app.get('/home', isLoggedIn, (req, res) => {
        /**
         * FOR TESTING PURPOSES
         * @type {Array}
         */
        const docs = [];
        for (let i = 0; i < 5; i++) {
            docs.push({
                "title": "Chicken Mashroob",
                "image": "../../public/test.jpg",
                "id": "123123"
            });
        }
        res.render(path.resolve(_viewsdir + '/Home/home.ejs'),{reco : docs});
        //getSimilarities(req, res);
    });


    app.get('/get_recipe', (req, res) => {
        const id = req.query.id;
        const data = {
            "id":"123123",
            "title": "Chicken Mashrrob",
            "extendedIngredients": ["rice", "krispies", "chicken"],
            "instructions": "First do this\n then That\n then do all this"
        };
        //get from database but nah
        if(id === '123123'){
            res.writeHead(200, {"Content-Type": "application/json"});
            res.end(JSON.stringify(data));
        }

        // Recipe.find({
        //     'id': {
        //         $in: id
        //     }
        // }, (err, docs) => {
        //     res.writeHead(200, {"Content-Type": "application/json"});
        //     if (err) {
        //         res.end("{}");
        //     }
        //     else
        //         res.end(JSON.stringify(data));
        // });

    });

};


function getSimilarities(req, res) {
    const uRecipeArr = []; // Final result array (User liked recipes with appended similarities)
    const recipeIds = []; // Array of liked recipes by current user stored by their ObjectIds
    let i = 0;

    // Loop through user feedback array and collect positively rated recipes
    const feedback = req.user.local.feedback;
    if (feedback.length > 0)
        _.each(req.user.local.feedback, f => {
            if (f.rating === 1) recipeIds[i++] = f.recipeId;
        });
    else; // TODO: Handle situation where no feedback has been given


    // Collect sorted list of recipes, projecting only their ids, titles, images, cooking time, and similarities
    // array
    Recipe.aggregate([{
        $project: {
            id: 1,
            title: 1,
            image: 1,
            similarities: 1
        }
    }, {$sort: {id: 1}}], (err, recipes) => {

        if(err)
            console.log(err);

        // Sort users liked recipes in ascending order to allow of O(nlogn) time looping.
        recipeIds.sort((a, b) => a.toString().localeCompare(b.toString()));

        // Find similar recipes that match what the user liked. Similar recipes correspond to the id of the recipes
        // they are similar too.
        // TODO Use FindById to match recipes rather than manually looking it up (what is happening now)
        _.each(recipes, recipe => {
            if (recipeIds[i] !== undefined) { // Poor way of checking if out of array bounds
                if (recipe.id.toString() === recipeIds[i].toString()) {  // Found match?
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
            'id': {
                $in: similarities
            }
        }, (err, docs) => {
            // Return result to client
            res.render(path.resolve(_viewsdir + '/Home/home.ejs'), {recommendations: docs});
        })
    });
}


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

