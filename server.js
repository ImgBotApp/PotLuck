/**
 * Created by Omar Taylor on 10/13/2016.
 */
var express = require('express'); // Require our module
var app = express(); // Instantiate our module
var port = process.env.PORT || 8080; // Set to port 8080 if environment variable not set
var https = require('https'); // For impending SSL/TLS future set up (Relevant code commented out for now)
var mongoose = require('mongoose'); // Require our database module
var passport = require('passport'); // Require our authentication module
var flash = require('connect-flash'); // Require our module for flash module
var morgan = require('morgan'); // Require our server activity logger module
var cookieParser = require('cookie-parser'); // Require our cookie parsing module
var bodyParser = require('body-parser'); // Parses incoming request bodies (made available in req.body)
var session = require('express-session'); // Parses session cookie, validates it, etc.
var serveStatic = require('serve-static'); // Statically serve content
var path = require('path'); // Require path module for configuring paths
var tls = require('tls'); // For impending SSL/TLS future set up (Relevant code commented out for now)
var fs = require('fs'); // Require module for interacting with file system
/*var options = {
    key: fs.readFileSync(__dirname + '/config/server.key'),
    cert: fs.readFileSync(__dirname + '/config/server.crt')
};*/

var configDB = require(__dirname + '/config/database.js'); // Require our database configurations
var configSesh = require(__dirname + '/config/sesh_conf.js'); //Require our session configurations
global.appRoot = __dirname; //set the global path so other files may use it

mongoose.Promise = global.Promise; // Use native promise

// Connect to our mongoDB database
mongoose.connect(configDB.url, function (err) {
    console.log('MongoDB Connection Initializing');
    if (err) { // Report any errors
        var asterisks = '';
        for (var i = 0; i < err.toString().length; i++) {
            asterisks += '*'
        }
        console.log('Connection to \'' + configDB.name + '\' Database: Failed.\n' + asterisks + '\n' + err + '\n' + asterisks + '\n');
    } else { // Otherwise, report the successful connection
        console.log('Connection to \'' + configDB.name + '\' Database: Established.');
    }
});

require(__dirname + '/config/passport')(passport); // pass our passport module for configuration

app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.urlencoded({extended: true})); // get information from html forms
app.use(bodyParser.json());

app.set('view engine', 'ejs'); // set up ejs for templating

app.use(session(configSesh)); // Keep user logged in
app.use('/public', serveStatic(path.join(__dirname, '/public'))); // Serve up public folder
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session


require(__dirname + '/app/Routes/')(app, passport); // load our routes and pass in our app and fully configured passport
/*https.createServer(options, app).listen(8080, function () {
 console.log("Listening on port " + port);
 });*/
app.listen(port);
console.log("Listening on port " + port);

module.exports = app;
