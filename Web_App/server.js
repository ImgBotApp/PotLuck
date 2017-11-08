/**
 * Created by Omar Taylor on 10/13/2016.
 */

'use strict';

require('dotenv').config();

global.appRoot = __dirname; //set the global path so other files may use it

const compression = require('compression');
const express = require('express'); // Require our module
const app = express(); // Instantiate our module
const minifyHTML = require('express-minify-html');
const port = process.env.PORT || 80; // Set to port 80 if environment variable not set
const https = require('https'); // For impending SSL/TLS future set up (Relevant code commented out for now)
const favicon = require('serve-favicon');
const mongoose = require('mongoose'); // Require our database module
const Grid = require('gridfs-stream'); // Require module for streaming files to and from MongoDB GridFS
const passport = require('passport'); // Require our authentication module
const flash = require('connect-flash'); // Require our module for flash module
const morgan = require('morgan'); // Require our server activity logger module
const cookieParser = require('cookie-parser'); // Require our cookie parsing module (needed for auth)
const bodyParser = require('body-parser'); // Parses incoming request bodies (made available in req.body)
const session = require('express-session'); // Parses session cookie, validates it, etc. Keeps users logged in.
const path = require('path'); // Require path module for configuring paths
const tls = require('tls'); // For impending SSL/TLS future set up (Relevant code commented out for now)
const fs = require('fs'); // Require module for interacting with file system
const ua = require('universal-analytics');
const toolbox = require('./toolbox/toolbox'); // Our handy-dandy functions

const configDB = require(__dirname + '/config/database.js'); // Require our database configurations
const configSesh = require(__dirname + '/config/sesh_conf.js'); //Require our session configurations

mongoose.Promise = global.Promise; // Use native promise

// Connect to our mongoDB database
Grid.mongo = mongoose.mongo;
mongoose.connect(configDB.url, {useMongoClient: true}).then(conn => {
    console.log('Connection to \'' + configDB.name + '\' Database: Established.');
    global.gfs = Grid(conn.db); // TODO: Find better solution for passing gfs variable
}).catch(err => {
    let asterisks = '';
    let i;
    for (i = 0; i < err.toString().length; i++) {
        asterisks += '*'
    }
    console.log('Connection to \'' + configDB.name + '\' Database: Failed.\n' + asterisks + '\n' + err + '\n' + asterisks + '\n');
});

require(__dirname + '/config/passport')(passport); // pass our passport module for configuration

app.use(compression(), morgan('dev'), cookieParser(), bodyParser.urlencoded({extended: true}), bodyParser.json(), session(configSesh), passport.initialize(), passport.session(), flash());

app.use(minifyHTML({
    override: true,
    exception_url: false,
    htmlMinifier: {
        removeComments: true,
        collapseWhitespace: true,
        collapseBooleanAttributes: true,
        removeAttributeQuotes: true,
        removeEmptyAttributes: true,
        minifyJS: true
    }
}));

app.set('view engine', 'ejs'); // set up ejs for templating

app.use(express.static('./public')); // Serve up public folder
app.use(express.static('./node_modules/bootstrap/dist'));
app.use(express.static('./node_modules/font-awesome'));
app.use(express.static('./node_modules/jquery/dist'));
app.use(express.static('./node_modules/materialize-css/dist'));
app.use(express.static('./node_modules/raleway-webfont'));
app.use(express.static('node_modules/w3-css'));

app.use(favicon(path.join(appRoot, 'public', 'images', 'favicon.ico')));

require(__dirname + '/app/Routes/')(app, passport); // load our routes and pass in our app and fully configured passport

app.listen(port);
console.log("Listening on port " + port);


setInterval(() => {
    fs.readFile('../Files/Recipes/Similarities_Appended/Aug_sims_test-534.json', 'utf8', (err, data) => {
        if (err) console.log(err); // Log any errors out to the console
        const obj = JSON.parse(data); // Parse JSON data as JavaScript object

        // Sort parsed similarities file for efficient looping.
        obj.sort((a, b) => {
            return a.id - b.id;
        });
        toolbox.similarity_recipe_join(obj);
    });
}, 3.6e+6);

module.exports = app;
