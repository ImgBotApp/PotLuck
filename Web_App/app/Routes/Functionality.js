/**
 * Created by yazan on 5/16/2017.
 */
'use strict';

const _viewsdir = appRoot + '/views';
const _modelsdir = appRoot + '/app/models';

const _ = require('underscore'); // Our JavaScript utility-belt (used for looping in our case)
const path = require('path'); // Require path module for configuring paths
const User = require(_modelsdir + '/users.js').User; // Require our user model
const Recipe = require(_modelsdir + '/recipes.js').Recipe; // Require of recipe model
const routes_list = require("../routes_list").routes_list; // List of routes to pass to EJS
const toolbox = require('../../toolbox/toolbox'); // Handy-dandy functions

let options = {routes: routes_list};

module.exports = (app, passport) => {

    app.get('/dashboard', isLoggedIn, (req, res) => getSimilarities(req, res));


    app.get('/get_recipe', isLoggedIn, (req, res) => {
        const id = req.query.id;
        Recipe.find().where('_id').in(id).lean().then(data => {
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(JSON.stringify(data[0]));
        }).catch(err => console.log(err))
    });

    app.get('/search', isLoggedIn, (req, res) => {
        const query = req.query.q;
        if (query.length > 0) {
            Recipe.find({
                title: {
                    $regex: '.*' + query + '.*',
                    $options: 'i'
                }
            }).limit(5).sort('aggregateLikes').select('_id title image').then(docs => {
                let search_res = {};
                docs.forEach(recipe => {
                    search_res[recipe.title] = {
                        id: recipe._id.toString(),
                        image: recipe.image
                    }
                });
                res.writeHead(200, {'Content-Type': 'application/json'});
                res.end(JSON.stringify({
                    recipes: search_res
                }));
            }).catch(err => {
                console.log(err);
            });
        } else {
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({recipes: undefined}));
        }
    });

    // Route for polling users on their food preferences
    app.get('/polling', isLoggedIn, (req, res) => {
        const version = req.query.version;

        // Collect single random recipe from the database, projecting only its id, title, and image
        // TODO To increase uniqueness of polling sample, increase sample size
        Recipe.aggregate({$sample: {size: 8}}, {
            $project: {
                _id: 1,
                title: 1,
                image: 1,
                cuisines: 1,
                readyInMinutes: 1
            }
        }, (err, docs) => {
            if (err) console.log(err);
            if (version === 'v2') {
                res.setHeader('Content-Type', 'application/json');
                const target = {
                    "_id": docs[0]._id,
                    "title": docs[0].title,
                    "image": docs[0].image,
                    "readyInMinutes": docs[0].readyInMinutes,
                    "cuisines": docs[0].cuisines
                };
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
        const ratings = [];
        let key_offset = 0;

        for (let key in req.body)
            if (req.body.hasOwnProperty(key))
                if (req.body[key].hasOwnProperty('rating') && req.body[key].hasOwnProperty('recipe')) {
                    if (req.body[key].rating < 0) {
                        key_offset++;
                        Recipe.findByIdAndUpdate(req.body[key].recipe, {$inc: {questionability: 1}}, {new: true}).then(recipe => console.log(recipe)).catch(err => console.log(err));
                    } else {
                        ratings[key - key_offset] = {
                            recipe: parseInt(req.body[key].recipe),
                            rating: req.body[key].rating
                        };
                    }
                }

        User.findByIdAndUpdate(req.user._id, {$push: {feedback: {$each: ratings}}}, {upsert: true}).then(() => {
            if (req.user.first_visit)
                User.findByIdAndUpdate(req.user._id, {first_visit: false}).then(() => res.send({
                    status: 'Success',
                    redirectTo: '/dashboard'
                }));
        }).catch(err => console.log(err));
    });
};

/**
 * Finds and returns recipes recommended recipes to user based on previous ratings.
 * @param req
 * @param res
 */
function getSimilarities(req, res) {
    const liked_recipes = []; // Array of liked recipes by current user stored by their ObjectIds
    let idx = 0;

    // Loop through user feedback array and collect positively rated recipes
    const feedback = req.user.feedback;
    if (feedback.length > 0)
        _.each(req.user.feedback, f => {
            if (f.rating === 1 && f.recipe) liked_recipes[idx++] = f.recipe;
        });
    else return res.redirect('/polling');

    // Collect sorted list of recipes, projecting only their ids, titles, images, cooking time, and similarities
    // array. NOTE: This new methods of doing this (using populate) seems to have more of a noticeable delay than the
    // method I was using before. There's no way to populate only a select amount of recipes like I was doing before.
    // May revert back to old method.
    User.findById(req.user._id).populate({
        path: 'feedback.recipe', // Populate recipe reference
        select: '_id title similarities', // Project only _id, title, and similarities array
        populate: {path: 'similarities.recipe'} // Deep populate similar recipes
    }).lean().then(recipes => {
        /**
         * Importance sampling in order to obtain better similar recipe estimates (Allows for gathering of lower
         * similarity variances)
         * @param number Number of recipes to return
         * @param recs Array of recommended recipes
         */
        function get_recipes(number, recs) {
            let i;

            // Calculate sum of recipe similarity values
            let sum = recs.reduce((total, curVal) => {
                if (typeof total === 'number')
                    return total + curVal.sim;
                else
                    return total.sim + curVal.sim;
            });

            // sort array based on values
            recs.sort(function (a, b) {
                return a['sim'] - b['sim'];
            });

            // Conduct importance sample to generate new similarity distribution
            const sim_sums = [];

            for (i = 0; i < recs.length; i++) {

                if (i > 0) {
                    sim_sums.push(recs[i].sim / sum + sim_sums[i - 1]);
                } else {
                    sim_sums[i] = recs[i].sim / sum;
                }


            }

            /**
             * // Get first recipe with similarity value greater than the randomly generated sample value
             * @param sim_arr Newly generated similarity distribution
             * @returns {number} Index of similar recipe
             */
            function gen_recipe(sim_arr) {
                const sample = Math.random(); // Generate random number between 0 and 1

                // Start with recipes with highest similarity value (array sorted by ascending similarity values)
                for (let i = sim_arr.length - 2; i > -1; i--) {
                    // Current recipe similarity values less than randomly generated sample value?
                    if (sample > sim_arr[i]) {
                        return i + 1; // Return index of first recipe with similarity greater than the sample
                    }
                }
                return 0;
            }


            const rec_return = []; // Final sample of similar recipes
            const map = {}; // To check for duplicates
            const min = Math.min(number, recs.length); // minimum number of samples to gather

            // Gather similar recipe samples
            for (i = 0; i < min; i++) {

                let idx = gen_recipe(sim_sums);

                // If generator returns duplicate, generate a new sample until sample is unique.
                while (typeof map[idx] === 'number') {
                    idx = gen_recipe(sim_sums);
                }


                toolbox.sortedInsert(recs[idx], rec_return, (a, b) => {
                    if (a.sim > b.sim) return -1;
                    if (a.sim < b.sim) return 1;
                    return 0;
                });

                map[idx] = 1;
            }


            return rec_return;
        }

        let offset = 0;
        const feedback = recipes.feedback;

        for (let i = 0; i < feedback.length; i++) {
            if (feedback[i].rating === 1) {
                liked_recipes[i - offset] = {
                    title: feedback[i].recipe.title,
                    _id: feedback[i].recipe._id,
                    similarities: get_recipes(Math.round(feedback[i].recipe.similarities.length / 10), feedback[i].recipe.similarities)
                }
            } else
                offset++;
        }

        options.reco = liked_recipes;
        res.render(path.resolve(_viewsdir + '/Dashboard/dashboard.ejs'), options);
    }).catch(err => {
        console.log(err);
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