/**
 * Created by O on 10/13/2016.
 */
var express       = require('express');
var app           = express();
var port          = process.env.PORT || 8080;
var http          = require('http');
var mongoose      = require('mongoose');
var passport      = require('passport');
var flash         = require('connect-flash');
var morgan        = require('morgan');
var cookieParser  = require('cookie-parser');
var bodyParser    = require('body-parser');
var session       = require('express-session');
var path          = require('path');
var sessionOptions = {
    cookieName: 'session',
    secret: 'ISU-DSL',
    duration: 30 * 60 * 1000, // 30 minutes
    activeDuration: 5 * 60 * 1000,
    resave: false,
    saveUninitialized: true
};
//var configDB = require('./config/database.js');

var configDB = require(__dirname + '/config/database.js');

mongoose.Promise = global.Promise;
mongoose.connect(configDB.url); // connect to the database

require(__dirname + '/config/passport')(passport); // pass passport for configuration

app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.urlencoded( {extended: true})); // get information from html forms
app.use(bodyParser.json());

app.set('view engine', 'ejs'); // set up ejs for templating

app.use(session(sessionOptions)); // Keep user logged in
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session
app.use('/public',express.static(__dirname + '/public'));





//require(__dirname + '/app/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport

app.listen(port);
console.log("Listening on port " + port);

module.exports = app;