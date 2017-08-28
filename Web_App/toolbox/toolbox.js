'use strict';

const Recipe = require('../app/models/recipes').Recipe;

module.exports = {
    similarity_recipe_join: data => {

        // Initialise the bulk operations array
        let bulkUpdateOps = [],
            counter = 0;

        data.forEach(recipe => {

            bulkUpdateOps.push({
                updateOne: {
                    filter: {"_id": recipe.id},
                    update: {"$set": {"similarities": recipe.similarities}}
                }
            });

            if (++counter % 500 === 0) {
                Recipe.bulkWrite(bulkUpdateOps); // Get the underlying collection via the native node.js driver collection object
                bulkUpdateOps = []; // re-initialize
            }
        });

        // Deposit remainder
        if (counter % 500 !== 0) Recipe.bulkWrite(bulkUpdateOps);
    }
};