/**
 * Created by O on 10/21/2016.
 */
// load the things we need
var mongoose = require('mongoose');

// define the schema for our user model
var recipeSchema = mongoose.Schema({

    title: String,
    image: {
        type: String,
        match: /^https:\/\//i
    }
});

// create the model for users and expose it to our app
module.exports = mongoose.model('Recipe', recipeSchema);
