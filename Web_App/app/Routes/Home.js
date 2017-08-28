/**
 * Created by yazan on 5/16/2017.
 */

const _viewsdir = appRoot + '/views';
const _modelsdir = appRoot + '/app/models';
const _toolboxdir = appRoot + '/toolbox/';

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
const toolbox = require(_toolboxdir + '/toolbox.js');


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
                "_id": "123123"
            });
        }
        //res.render(path.resolve(_viewsdir + '/Home/home.ejs'),{reco : docs});
        getSimilarities(req, res);
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
    const liked_recipes = []; // Array of liked recipes by current user stored by their ObjectIds
    let i = 0;

    // Loop through user feedback array and collect positively rated recipes
    const feedback = req.user.local.feedback;
    if (feedback.length > 0)
        _.each(req.user.local.feedback, f => {
            if (f.rating === 1) liked_recipes[i++] = f.recipeId;
        });
    // else // TODO: Handle situation where no feedback has been given

    // Collect sorted list of recipes, projecting only their ids, titles, images, cooking time, and similarities
    // array
    Recipe.find().where('_id').in(liked_recipes).select('_id title similarities').sort('_id').then(recipes => {
        const recipe_queries = [];
        const sims_to_lookup = [];
        for (let i = 0; i < recipes.length; i++) {
            const most_sim = recipes[i].similarities[0].sim;
            sims_to_lookup[i] = [];
            liked_recipes[i] = {
                _id: recipes[i]._id,
                title: recipes[i].title,
            };
            for (let j = 0; j < recipes[i].similarities.length; j++)
                if (most_sim * 0.5 < recipes[i].similarities[j].sim)
                    sims_to_lookup[i].push(parseInt(recipes[i].similarities[j].id));
        }

        sims_to_lookup.forEach(recipe => recipe_queries.push(Recipe.find({_id: {$in: recipe}})));

        return Promise.all(recipe_queries);

    }).then(results => {
        liked_recipes.forEach((recipe, idx) => {
            recipe.similarities = results[idx]
        });

        res.render(path.resolve(_viewsdir + '/Home/home.ejs'), {recommendations: liked_recipes});
    }).catch(err => {
        console.log(err);
    })
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

