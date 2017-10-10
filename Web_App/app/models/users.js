/**
 * Created by O on 10/21/2016.
 */
const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');


// define the schema for our user model
const userSchema = mongoose.Schema({
    local: {
        name: String,
        email: String,
        password: String,
        picture: {
            type: String
        }
    },
    facebook: {
        id: String,
        token: String,
        email: String,
        name: String,
        picture: {
            type: String,
            match: /^https:\/\//i
            //required: true,
        }
    },
    twitter: {
        id: String,
        token: String,
        displayName: String,
        username: String,
        email: String,
        picture: {
            type: String,
            //required: true,
            match: /^https:\/\//i
        }
    },
    google: {
        id: String,
        token: String,
        email: String,
        name: String,
        picture: {
            type: String,
            //required: true,
            match: /^https:\/\//i
        }
    },
    github: {
        id: String,
        token: String,
        email: String,
        username: String,
        name: String,
        picture: {
            type: String,
            //required: true,
            match: /^https:\/\//i
        }
    },
    feedback: [new mongoose.Schema({
        recipe: {type: Number, ref: 'Recipe'},
        rating: Number
    }, {_id: false})], // Create a new schema for user feedback, but don't give it an id.
    connected_accounts: Number,
    first_visit: {type: Boolean, default: true}
});

// methods ======================
// generating a hash
userSchema.methods.generateHash = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function (password) {
    return bcrypt.compareSync(password, this.local.password);
};

// create the model for users and expose it to our app
module.exports.User = mongoose.model('User', userSchema);
