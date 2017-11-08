/**
 * Created by omarc on 1/24/2017.
 */

localhost_callback = 'http://localhost/auth/';

module.exports = {

    facebookAuth: {
        clientID: process.env.FACEBOOK_AUTH_CLIENT_ID,
        clientSecret: process.env.FACEBOOK_AUTH_CLIENT_SECRET,
        callbackURLs: [localhost_callback + 'facebook/callback', 'http://potluck.cafe/auth/facebook/callback']
    },

    twitterAuth: {
        consumerKey: process.env.TWITTER_AUTH_CONSUMER_KEY,
        consumerSecret: process.env.TWITTER_AUTH_CONSUMER_SECRET,
        callbackURLs: [localhost_callback + 'twitter/callback', 'http://potluck.cafe/auth/twitter/callback']
    },

    googleAuth: {
        clientID: process.env.GOOGLE_AUTH_CLIENT_ID,
        clientSecret: process.env.GOOGLE_AUTH_CLIENT_SECRET,
        callbackURLs: [localhost_callback + 'google/callback', 'http://potluck.cafe/auth/google/callback']
    },

    githubAuth: {
        clientID: process.env.GITHUB_AUTH_CLIENT_ID,
        clientSecret: process.env.GITHUB_AUTH_CLIENT_SECRET,
        callbackURLs: [localhost_callback + 'github/callback', 'http://potluck.cafe/auth/github/callback']
    },

    linkedinAuth: {
        clientID: process.env.LINKEDIN_AUTH_CLIENT_ID,
        clientSecret: process.env.LINKEDIN_AUTH_CLIENT_SECRET,
        callbackURLs: [localhost_callback + 'linkedin/callback', 'http://potluck.cafe/auth/linkedin/callback']
    }
};