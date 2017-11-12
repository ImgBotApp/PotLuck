/**
 * Created by yazan on 5/16/2017.
 */

_routesDir = appRoot + '/app/Routes';
module.exports = (app, passport) => {
    exports.Admin = require(_routesDir + '/Admins.js')(app);
    exports.Functionality = require(_routesDir + '/Functionality.js')(app);
    exports.Home = require(_routesDir + '/Home.js')(app);
    exports.Users = require(_routesDir + '/Users.js')(app, passport);
    exports.Debug = require(_routesDir + '/Debug.js')(app);

    // Page Caching for Speed optimization
    app.use((req, res, next) => {
        if (!('PageResponse' in res))
            return next();

        res.setHeader('Cache-Control', 'public, max-age=1800'); // 15 minutes max age
        res.render(res.PageResponse.path, res.PageResponse.options);
    });
};