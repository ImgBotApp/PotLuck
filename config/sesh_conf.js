/**
 * Created by O on 11/11/2016.
 */
module.exports = {
    cookieName: 'session',
    secret: 'ISU-DSL0',
    duration: 30 * 60 * 1000, // 30 minutes
    activeDuration: 5 * 60 * 1000,
    resave: false,
    saveUninitialized: true
};