/**
 * Created by yazan on 5/16/2017.
 */

const _viewsdir = appRoot + '/views';
const _modelsdir = appRoot + '/app/models';

const path = require('path'); // Require path module for configuring paths
const routes_list = require("../routes_list").routes_list; // List of routes to pass to EJS

const visitors = new Set();

let options = {
    routes: routes_list,
    play_intro: true
};

module.exports = (app, passport) => {
    // Our homepage
    app.get('/', (req, res, next) => {
        let ip;

        /*for (let v of visitors) {

        }

        if (ip = visitors.find(addr => {
                if (addr === req.ip)
                    return addr === req.ip;
            })) {
            if (ip.visited_intro)
                options.play_intro = false;
        } else
            visitors.add({
                visited_intro: true,
                visited_index: false
            });*/
        res.PageResponse = {path: path.resolve(_viewsdir + '/Home/intro.ejs'), options: options}; // Render view
        next();
    });

    // Sign-in page/dashboard
    app.get('/index', (req, res) => {
        options.loggedin = req.user !== undefined; // Check if user is logged in and pass the result to the client
        options.user = req.user; // Pass the user model to the client

        res.PageResponse = {path: path.resolve(_viewsdir + '/Home/index.ejs'), options: options};
        res.render(path.resolve(_viewsdir + '/Home/index.ejs'), options);
    });


    // Route for privacy page
    app.get('/privacy_policy', (req, res) => {
        options.loggedin = req.user !== undefined; // Check if user is logged in and pass the result to the client

        res.PageResponse = {path: path.resolve(_viewsdir + '/Privacy/privacy.ejs'), options: options};
        res.render(path.resolve(_viewsdir + '/Privacy/privacy.ejs'), options);
    });

    // Route for terms page
    app.get('/terms', (req, res) => {
        options.loggedin = req.user !== undefined; // Check if user is logged in and pass the result to the client

        res.PageResponse = {path: path.resolve(_viewsdir + '/Terms/terms.ejs'), options: options};
        res.render(path.resolve(_viewsdir + '/Terms/terms.ejs'), options);
    });



    app.get('/feedback',(req,res) =>{
        res.render(path.resolve(_viewsdir + '/Home/Feedback.ejs'));
    });


    app.post('/feedback',(req,res)=>{
       var data = req.body;
        fs.appendFile(path.resolve(appRoot + '/feedback/feedbackLog.txt'),
        JSON.stringify(data,null,2));
    });
};
