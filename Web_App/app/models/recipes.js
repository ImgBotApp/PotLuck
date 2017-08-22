/**
 * Created by O on 10/21/2016.
 */
const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

// define the schema for our recipe model
const recipeSchema = mongoose.Schema({
    _id: Number,
    vegetarian: Boolean,
    vegan: Boolean,
    glutenFree: Boolean,
    dairyFree: Boolean,
    veryHealthy: Boolean,
    cheap: Boolean,
    veryPopular: Boolean,
    sustainable: Boolean,
    weightWatcherSmartPoints: Number,
    gaps: String,
    lowFodmap: Boolean,
    ketogenic: Boolean,
    whole30: Boolean,
    servings: Number,
    sourceUrl: String,
    spoonacularSourceUrl: String,
    aggregateLikes: Number,
    creditText: String,
    license: String,
    sourceName: String,
    extendedIngredients: [{
        id: Number,
        aisle: String,
        image: String,
        name: String,
        amount: Number,
        unit: String,
        unitShort: String,
        unitLong: String,
        originalString: String,
        metaInformation: [String]
    }],
    id: Number,
    title: String,
    readyInMinutes: Number,
    image: String,
    imageType: String,
    cuisines: [String],
    instructions: String,
    similarities: [new mongoose.Schema({
        id: String,
        sim: Number
    }, {_id: false})]
});

// create the model for recipes and expose it to our app
module.exports.Recipe = mongoose.model('Recipe', recipeSchema);
