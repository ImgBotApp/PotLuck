/**
 * Created by yazan on 5/16/2017.
 */


const _viewsdir = appRoot+'/views';
const _modelsdir = appRoot + '/app/models';

var _ = require('underscore'); // Our JavaScript utility-belt (used for looping in our case)
var path = require('path'); // Require path module for configuring paths
var bcrypt = require('bcrypt-nodejs'); // Require our encryption algorithm
var fs = require('fs'); // Require module for interacting with file system
var Grid = require('gridfs-stream'); // Require module for streaming files to and from MongoDB GridFS
var User = require(_modelsdir + '/users.js'); // Require our user model
var Recipe = require(_modelsdir+'/recipes.js'); // Require of recipe model
var mongoose = require('mongoose'); // Require mongoose (used from GridFS connection)
var multer = require('multer'); // Require module for handling multipart form data (used for uploading files)
var upload = multer({dest: "./uploads"}); // Set upload location (destination)
var _ = require('underscore'); // Our JavaScript utility-belt (used for looping in our case)
var conn = mongoose.connection;
Grid.mongo = mongoose.mongo;
var gfs = Grid(conn.db);


module.exports = function (app,passport) {
    // Our homepage
    app.get('/', function (req, res) {
        res.render(path.resolve(_viewsdir + '/Home/intro.ejs')); // Render view
    });

    // Sign-in page/dashboard
    app.get('/index', function (req, res) {
        res.render(path.resolve(_viewsdir + '/Home/index.ejs'), { // Render view with given options
            loggedin: req.user !== undefined, // Check if user is logged in and pass the result to the client
            user: req.user // Pass the user model to the client
        });
    });



    // Route for privacy page
    app.get('/privacy_policy', function (req, res) {
        res.render(path.resolve(_viewsdir + '/Privacy/privacy.ejs'));
    });

    // Route for terms page
    app.get('/terms', function (req, res) {
        res.render(path.resolve(_viewsdir + '/Terms/terms.ejs'));
    });


    app.get('/home',function (req,res) {
        res.render(path.resolve(_viewsdir + '/Home/home.ejs'),recommendations:);
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

/**
 * Function for generating a hash
 * @param password Password to be hashed
 * @returns {*} Encrypted password
 */
function generateHash(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
}
