/**
 * Created by Omar on 10/13/2016.
 */
var express = require('express');
var app = express();
var port = process.env.PORT || 8080;
var http = require('http');
var https = require('https');
var mongoose = require('mongoose');
var passport = require('passport');
var flash = require('connect-flash');
var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var serveStatic = require('serve-static');
var path = require('path');
var tls = require('tls');
var fs = require('fs');
var options = {
    key: fs.readFileSync(__dirname + '/config/server.key'),
    cert: fs.readFileSync(__dirname + '/config/server.crt')
};

var unirest = require('unirest');

var configDB = require(__dirname + '/config/database.js');
var configSesh = require(__dirname + '/config/sesh_conf.js');

mongoose.Promise = global.Promise;
console.log('MongoDB Connection Initializing');

mongoose.connect(configDB.url, function (err) {
    if (err) {
        var asterisks = '';
        for (var i = 0; i < err.toString().length; i++) {
            asterisks += '*'
        }
        console.log('Connection to \'' + configDB.name + '\' Database: Failed.\n' + asterisks + '\n' + err + '\n' + asterisks + '\n');
    } else {
        console.log('Connection to \'' + configDB.name + '\' Database: Established.');
    }
}); // connect to the database

require(__dirname + '/config/passport')(passport); // pass passport for configuration

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


require(__dirname + '/app/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport

/*https.createServer(options, app).listen(8080, function () {
 console.log("Listening on port " + port);
 });*/
app.listen(port);
console.log("Listening on port " + port);

module.exports = app;