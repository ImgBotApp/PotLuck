/**
 * Created by Omar Taylor on 10/13/2016.
 */
const express = require('express'); // Require our module
const app = express(); // Instantiate our module
const port = process.env.PORT || 8080; // Set to port 8080 if environment variable not set
const https = require('https'); // For impending SSL/TLS future set up (Relevant code commented out for now)
const mongoose = require('mongoose'); // Require our database module
const Recipe = require('./app/models/recipes'); // Require of recipe model
const passport = require('passport'); // Require our authentication module
const flash = require('connect-flash'); // Require our module for flash module
const morgan = require('morgan'); // Require our server activity logger module
const cookieParser = require('cookie-parser'); // Require our cookie parsing module (needed for auth)
const bodyParser = require('body-parser'); // Parses incoming request bodies (made available in req.body)
const session = require('express-session'); // Parses session cookie, validates it, etc. Keeps users logged in.
const serveStatic = require('serve-static'); // Statically serve content
const path = require('path'); // Require path module for configuring paths
const tls = require('tls'); // For impending SSL/TLS future set up (Relevant code commented out for now)
const fs = require('fs'); // Require module for interacting with file system
const _ = require('underscore'); // Our JavaScript utility-belt (used for looping in our case)

/*var options = {
 key: fs.readFileSync(__dirname + '/config/server.key'),
 cert: fs.readFileSync(__dirname + '/config/server.crt')
 };*/

const configDB = require(__dirname + '/config/database.js'); // Require our database configurations
const configSesh = require(__dirname + '/config/sesh_conf.js'); //Require our session configurations
global.appRoot = __dirname; //set the global path so other files may use it

mongoose.Promise = global.Promise; // Use native promise

// Connect to our mongoDB database
mongoose.connect(configDB.url, function (err) {
    console.log('MongoDB Connection Initializing');
    if (err) { // Report any errors
        let asterisks = '';
        for (let i = 0; i < err.toString().length; i++) {
            asterisks += '*'
        }
        console.log('Connection to \'' + configDB.name + '\' Database: Failed.\n' + asterisks + '\n' + err + '\n' + asterisks + '\n');
    } else { // Otherwise, report the successful connection
        console.log('Connection to \'' + configDB.name + '\' Database: Established.');
    }
});

require(__dirname + '/config/passport')(passport); // pass our passport module for configuration

app.use(morgan('dev'), cookieParser(), bodyParser.urlencoded({extended: true}), bodyParser.json(), session(configSesh), passport.initialize(), passport.session(), flash());

app.set('view engine', 'ejs'); // set up ejs for templating

app.use('/public', serveStatic('public')); // Serve up public folder
app.use('/node_modules/bootstrap', serveStatic('node_modules/bootstrap'));
app.use('/node_modules/font-awesome', serveStatic('node_modules/font-awesome'));
app.use('/node_modules/jquery', serveStatic('node_modules/jquery'));
app.use('/node_modules/w3-css', serveStatic('node_modules/w3-css'));

require(__dirname + '/app/Routes/')(app, passport); // load our routes and pass in our app and fully configured passport
/*https.createServer(options, app).listen(8080, function () {
 console.log("Listening on port " + port);
 });*/
app.listen(port);
console.log("Listening on port " + port);

/*setInterval(function () {
 // Collected recipes, projecting the results by their ids
 Recipe.aggregate([{$project: {_id: 1}}], function (err, recipes) {
 // Read similarities JSON file
 fs.readFile(__dirname + '/app/experimental/sims_test-1000.json', 'utf8', function (err, data) {
 if (err) console.log(err); // Log any errors out to the console

 var obj = JSON.parse(data); // Parse JSON data as JavaScript object

 // Sort parsed similarities file for efficient looping.
 obj.sort(function (a, b) {
 return a._id.localeCompare(b._id);
 });

 // Link each recipe with its corresponding list of related recipes
 obj.forEach(function (similarity) {
 recipes.some(function (recipe, index) {
 var isEqual = similarity._id === recipe._id.toString();
 if (isEqual) {
 Recipe.findByIdAndUpdate(recipe._id, {$push: {'similarities': similarity.similarities}}, {
 upsert: true,
 sort: {_id: 1}
 }, function (err) {
 if (err) return console.log(err);
 });
 }
 return isEqual;
 });
 });
 });
 });
 }, 10000);*/

module.exports = app;
