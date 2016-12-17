/**
 * Created by Omar on 10/13/2016.
 */
var express      = require('express');
var app          = express();
var port         = process.env.PORT || 8080;
var http         = require('http');
var mongoose     = require('mongoose');
var passport     = require('passport');
var flash        = require('connect-flash');
var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');
var serveStatic  = require('serve-static');
var path         = require('path');
var unirest      = require('unirest');
//var client       = require('tunnel-ssh');

var configDB     = require(__dirname + '/config/database.js');
var configSesh   = require(__dirname + '/config/sesh_conf.js');
//var configTunnel = require(__dirname + '/config/ssh_conf.js');

/*var server = client(configTunnel, function (error, server) {
    if (error) {
        console.log("SSH connection error " + error);
    }
    });*/

    console.log('MongoDB Connection Initializing');

    mongoose.connect(configDB.url); // connect to the database

require(__dirname + '/config/passport')(passport); // pass passport for configuration

app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.urlencoded( {extended: true})); // get information from html forms
app.use(bodyParser.json());

app.set('view engine', 'ejs'); // set up ejs for templating

app.use(session(configSesh)); // Keep user logged in
app.use('/public', serveStatic(path.join(__dirname, '/public')));
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session




require(__dirname + '/app/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport

app.listen(port);
console.log("Listening on port " + port);

module.exports = app;