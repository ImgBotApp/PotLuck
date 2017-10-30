'use strict';


const _modelsdir = appRoot + '/app/models';

const Recipe = require(_modelsdir + '/recipes').Recipe;

module.exports = {
    similarity_recipe_join: data => {

        // Initialise the bulk operations array
        let bulkUpdateOps = [],
            counter = 0;

        data.forEach(recipe => {

            const sims = [];

            for (let idx = 0; idx < recipe.similarities.length; idx++) {
                sims[idx] = {
                    recipe: parseInt(recipe.similarities[idx].id),
                    sim: recipe.similarities[idx].sim
                };
            }

            bulkUpdateOps.push({
                updateOne: {
                    filter: {"_id": recipe.id},
                    update: {"$set": {"similarities": sims}}
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
    },

    sortedInsert: (el, arr, comparer) => {
        function locationOf(el, arr, start, end) {
            if (arr.length === 0)
                return -1;

            start = start || 0;
            end = end || arr.length;
            const pivot = (start + end) >> 1;

            const c = comparer(el, arr[pivot]);
            if (end - start <= 1)
                return c === -1 ? pivot - 1 : pivot;

            switch (c) {
                case -1:
                    return locationOf(el, arr, start, pivot);
                case 0:
                    return pivot;
                case 1:
                    return locationOf(el, arr, pivot, end);
            }
        }

        arr.splice(locationOf(el, arr) + 1, 0, el);
        return arr;
    },

    capitalizeFL(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
};