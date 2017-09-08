/**
 * Created by omarc on 1/24/2017.
 */
module.exports = {

    'facebookAuth': {
        'clientID': process.env.FACEBOOK_AUTH_CLIENT_ID,
        'clientSecret': process.env.FACEBOOK_AUTH_CLIENT_SECRET,
        'callbackURL': 'http://162.243.2.42:8080/auth/facebook/callback'
    },

    'twitterAuth': {
        'consumerKey': process.env.TWITTER_AUTH_CONSUMER_KEY,
        'consumerSecret': process.env.TWITTER_AUTH_CONSUMER_SECRET,
        'callbackURL': 'http://162.243.2.42:8080/auth/twitter/callback'
    },

    'googleAuth': {
        'clientID': process.env.GOOGLE_AUTH_CLIENT_ID,
        'clientSecret': process.env.GOOGLE_AUTH_CLIENT_SECRET,
        'callbackURL': 'http://162.243.2.42:8080/auth/google/callback'
    },

    'githubAuth': {
        'clientID': process.env.GITHUB_AUTH_CLIENT_ID,
        'clientSecret': process.env.GITHUB_AUTH_CLIENT_SECRET,
        'callbackURL': 'http://162.243.2.42:8080/auth/github/callback'
    }

};