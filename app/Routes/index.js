/**
 * Created by yazan on 5/16/2017.
 */

_routesDir = appRoot + '/app/Routes';
module.exports = (app, passport) => {
    exports.Functionality = require(_routesDir + '/Functionality.js')(app, passport);
    exports.Home = require(_routesDir + '/Home.js')(app, passport);
    exports.Users = require(_routesDir + '/Users.js')(app, passport);
};