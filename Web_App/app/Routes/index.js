/**
 * Created by yazan on 5/16/2017.
 */

_routesDir = appRoot + '/app/Routes';
module.exports = (app, passport) => {
    exports.Functionality = require(_routesDir + '/Functionality.js')(app, passport);
    exports.Home = require(_routesDir + '/Home.js')(app, passport);
    exports.Users = require(_routesDir + '/Users.js')(app, passport);
    exports.Debug = require(_routesDir + '/Debug.js')(app, passport);

    // Page Caching for Speed optimization
    app.use((req, res, next) => {
        if (!('PageResponse' in res))
            return next();

        res.setHeader('Cache-Control', 'public, max-age=1800'); // 15 minutes max age
        res.render(res.PageResponse.path, res.PageResponse.options);
    });
};