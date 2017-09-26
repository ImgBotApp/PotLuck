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

            if (++counter % 200 === 0) {
                Recipe.bulkWrite(bulkUpdateOps); // Get the underlying collection via the native node.js driver collection object
                bulkUpdateOps = []; // re-initialize
            }
        });

        // Deposit remainder
        if (counter % 200 !== 0) Recipe.bulkWrite(bulkUpdateOps);
    },

    validateEmail: email => {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    },

    validateName: name => {
        return name.length > 1 && name.length < 71;
    },

    validatePassword: password => {
        return password.length > 2;
    },

    normalizeName: name => {
        return name.trim().replace(/\w\S*/g, str => {
            return str.charAt(0).toUpperCase() + str.substr(1).toLowerCase();
        });
    }
};