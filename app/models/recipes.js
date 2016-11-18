/**
 * Created by O on 10/21/2016.
 */
// load the things we need
var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;

// define the schema for our user model
var ratingsSchema = mongoose.Schema({
    rating : Number,
    recipe : ObjectId
});

// create the model for users and expose it to our app
module.exports = mongoose.model('Ratings', ratingsSchema);
