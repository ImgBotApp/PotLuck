/**
 * Created by omarc on 7/12/2017.
 */

const _viewsdir = appRoot + '/views';
const _modelsdir = appRoot + '/app/models';

const path = require('path'); // Require path module for configuring paths
const Recipe = require(_modelsdir + '/recipes.js').Recipe; // Require of recipe model


module.exports = (app) => {
// Displays random recipe from the database (for testing purposes)
    app.get('/rand_recipe', (req, res) => {

        Recipe.aggregate({$sample: {size: 1}}, (err, doc) => {
            if (err) console.log(err);
            res.render(path.resolve(_viewsdir + '/RecipeView/recipe.ejs'), {
                recipe: doc[0],
                navbar: ['Home', 'Dashboard', 'Profile', 'Polling', 'About', 'Logout']
            });
        });
    });
};