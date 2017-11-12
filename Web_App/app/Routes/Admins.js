/**
 * Created by Omar on 11/11/2017
 */

'use strict';

const _viewsdir = appRoot + '/views';
const _modelsdir = appRoot + '/app/models';

const path = require('path'); // Require path module for configuring paths
const User = require(_modelsdir + '/users.js').User; // Require our user model
const routes_list = require("../routes_list").routes_list; // List of routes to pass to EJS

const options = {routes: routes_list};

module.exports = app => {
    app.get('/admin', isLoggedIn, isAdmin, (req, res) => {
        options.user = req.user;
        res.render(path.resolve(_viewsdir + '/Admin_Panel/ap.ejs'), options);
    });

    app.get('/admin/register', isLoggedIn, (req, res) => {
        res.render(path.resolve(_viewsdir + '/Admin_Panel/ap_auth.ejs'), options);
    });

    app.post('/admin/register', isLoggedIn, (req, res) => {
        if (req.body.password === process.env.ADMIN_PASS) {
            User.findByIdAndUpdate(req.user._id, {isAdmin: true}).then(() => successfulMsg(res)).catch(err => {
                console.log(err);

                unsuccessfulMsg(res);
            });
        } else
            unsuccessfulMsg(res);

        function unsuccessfulMsg(res) {
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({err: "Unsuccessful elevation!"}));
        }

        function successfulMsg(res) {
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({err: null}));
        }
    });
};

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

function isAdmin(req, res, next) {
    if (req.user.isAdmin)
        return next();

    res.redirect('/admin/register');
}