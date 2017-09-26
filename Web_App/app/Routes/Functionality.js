/**
 * Created by yazan on 5/16/2017.
 */
'use strict';

const _viewsdir = appRoot + '/views';
const _modelsdir = appRoot + '/app/models';

const _ = require('underscore'); // Our JavaScript utility-belt (used for looping in our case)
const path = require('path'); // Require path module for configuring paths
const bcrypt = require('bcrypt-nodejs'); // Require our encryption algorithm
const User = require(_modelsdir + '/users.js').User; // Require our user model
const Recipe = require(_modelsdir + '/recipes.js').Recipe; // Require of recipe model
const routes_list = require("../routes_list").routes_list; // List of routes to pass to EJS

let options = {routes: routes_list};

module.exports = (app, passport) => {

    app.get('/dashboard', isLoggedIn, (req, res) => {
        getSimilarities(req, res);
    });


    app.get('/get_recipe', (req, res) => {
        const id = req.query.id;
        Recipe.find().where('_id').in(id).then(data => {
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(JSON.stringify(data[0].toObject()));
        }).catch(err => {
            console.log(err);
        })
    });

    app.get('/search', isLoggedIn, (req, res) => {
        const query = req.query.q;
        Recipe.find().where('title').regex('.*' + query + '.*').limit(5).sort('aggregateLikes').select('_id title').then(docs => {
            let search_res = {};
            docs.forEach(recipe => {
                search_res[recipe.title] = recipe._id.toString();
            });
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(JSON.stringify(search_res));
        }).catch(err => {
            console.log(err);
        });
    });

    // Route for polling users on their food preferences
    app.get('/polling', isLoggedIn, (req, res) => {
        const version = req.query.version;

        // Collect single random recipe from the database, projecting only its id, title, and image
        // TODO To increase uniqueness of polling sample, increase sample size
        Recipe.aggregate({$sample: {size: 15}}, {$project: {_id: 1, title: 1, image: 1, cuisines: 1}}, (err, docs) => {
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
                options.recipes = docs;
                options.user = req.user;
                res.render(path.resolve(_viewsdir + '/Polling/polling.ejs'), options);
            }
        });
    });

    // Process user feedback results
    app.post('/polling', isLoggedIn, (req, res) => {
        let ratings = [];

        for (let key in req.body) if (req.body.hasOwnProperty(key)) ratings[key] = req.body[key];

        User.findByIdAndUpdate(req.user._id, {$push: {"local.feedback": {$each: ratings}}}, {upsert: true}, err => {
            if (err) return console.log(err);
            else res.send({
                status: 'Success',
                redirectTo: '/dashboard'
            });
        });
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
    else {
        res.redirect('/polling');
    }

    // Collect sorted list of recipes, projecting only their ids, titles, images, cooking time, and similarities
    // array
    Recipe.find().where('_id').in(liked_recipes).select('_id title similarities').sort('_id').then(recipes => {
        const recipe_queries = []; // Array of MongoDB queries
        const sims_to_lookup = []; // Array of arrays. Array of similar recipes separated by index

        // Loop through returned recipes
        for (let i = 0; i < recipes.length; i++) {
            const most_sim = recipes[i].similarities[0].sim; // Get value of most similar recipe of recipe at current index
            sims_to_lookup[i] = []; // Instantiate empty array to push similar recipes into
            liked_recipes[i] = {
                _id: recipes[i]._id,
                title: recipes[i].title,
            }; // Start building object to return to dashboard.ejs
            for (let j = 0; j < recipes[i].similarities.length; j++) // Loop through similarities array of returned recipes
                if (most_sim * 0.5 < recipes[i].similarities[j].sim) // Push only similar recipe ids that are at least half as similar as most similar recipe
                    sims_to_lookup[i].push(parseInt(recipes[i].similarities[j].id));
        }

        // Lookup similar recipes in data. Multiple database queries are necessary to know which returned similar recipe
        // belongs to which user rated recipe
        sims_to_lookup.forEach(recipe => recipe_queries.push(Recipe.find({_id: {$in: recipe}})));

        // Make call to database
        return Promise.all(recipe_queries);

    }).then(results => {
        liked_recipes.forEach((recipe, idx) => {
            recipe.similarities = results[idx]
        }); // Append similarities to their corresponding recipes (order is predictable so just a matter of matching indices

        options.reco = liked_recipes;
        res.render(path.resolve(_viewsdir + '/Dashboard/dashboard.ejs'), options);
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