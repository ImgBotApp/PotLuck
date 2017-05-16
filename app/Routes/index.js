/**
 * Created by yazan on 5/16/2017.
 */

_routesDir = appRoot + '/app/Routes';
module.exports = function (app,passport) {
    exports.Home = require(_routesDir + '/Functionality.js');
    exports.Users = require(_routesDir + '/Users.js');
}