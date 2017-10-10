/**
 * Created by yazan on 5/16/2017.
 */

const _viewsdir = appRoot + '/views';

const path = require('path'); // Require path module for configuring paths
const routes_list = require("../routes_list").routes_list; // List of routes to pass to EJS

let options = {routes: routes_list};

module.exports = (app, passport) => {
    // Our homepage
    app.get('/', (req, res) => {
        res.render(path.resolve(_viewsdir + '/Home/intro.ejs'), options); // Render view
    });

    // Sign-in page/dashboard
    app.get('/index', (req, res) => {
        options.loggedin = req.user !== undefined; // Check if user is logged in and pass the result to the client
        options.user = req.user; // Pass the user model to the client
        res.render(path.resolve(_viewsdir + '/Home/index.ejs'), options);
    });


    // Route for privacy page
    app.get('/privacy_policy', (req, res) => {
        options.loggedin = req.user !== undefined; // Check if user is logged in and pass the result to the client
        res.render(path.resolve(_viewsdir + '/Privacy/privacy.ejs'), options);
    });

    // Route for terms page
    app.get('/terms', (req, res) => {
        options.loggedin = req.user !== undefined; // Check if user is logged in and pass the result to the client
        res.render(path.resolve(_viewsdir + '/Terms/terms.ejs'), options);
    });
};
