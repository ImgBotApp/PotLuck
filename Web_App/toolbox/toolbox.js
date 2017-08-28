'use strict';

module.exports = {
    similarity_recipe_join: src => {
        if (src.constructor === File()) {

        } else {

        }

        if (err) console.log(err); // Log any errors out to the console

        function bulkLink(obj) {
            // Initialise the bulk operations array
            let bulkUpdateOps = [],
                counter = 0;

            obj.forEach(sims => {

                bulkUpdateOps.push({
                    updateOne: {
                        filter: {"_id": sims.id},
                        update: {"$set": {"similarities": sims.similarities}}
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

        const obj = JSON.parse(data); // Parse JSON data as JavaScript object

        // Sort parsed similarities file for efficient looping.
        obj.sort((a, b) => {
            return a.id < b.id ? -1 : a.id === b.id ? 0 : 1;
        });

        // Clear "similarities" field for all documents in the recipes collection

        Recipe.update({}, {$unset: {similarities: ""}}, {multi: true}, (err) => {
            if (err) console.log(err);
            // Link recipes with their corresponding list of related recipes
            bulkLink(obj);
        });
    }
};