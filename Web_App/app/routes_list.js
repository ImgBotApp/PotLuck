/**
 * Created by O on 10/21/2016.
 */

exports.routes_list = {
    // Routes Table

    // Social
    auth_facebook: {
        pathname: "/auth/facebook"
    },
    auth_github: {
        pathname: "auth/github"
    },
    auth_google: {
        pathname: "/auth/google"
    },
    auth_twitter: {
        pathname: "/auth/twitter"
    },
    connect_local: {
        pathname: "/connect/local"
    },
    connect_facebook: {
        pathname: "/connect/facebook"
    },
    connect_github: {
        pathname: "/connect/github"
    },
    connect_google: {
        pathname: "/connect/google"
    },
    connect_twitter: {
        pathname: "/connect/twitter"
    },
    unlink_facebook: {
        pathname: "/unlink/facebook"
    },
    unlink_github: {
        pathname: "/unlink/github"
    },
    unlink_google: {
        pathname: "/unlink/google"
    },
    unlink_twitter: {
        pathname: "/unlink/twitter"
    },

    // Application
    get_recipe: {
        pathname: "/get_recipe"
    },
    index: {
        pathname: "/index"
    },
    intro: {
        pathname: "/"
    },
    login: {
        pathname: "/login"
    },
    privacy_policy: {
        pathname: "/privacy_policy",
        alias: "Privacy Policy"
    },
    signup: {
        pathname: "/signup"
    },
    tos: {
        pathname: "/terms",
        alias: "Terms of Service"
    },

    // Navbar
    navbar: {
        dashboard: {
            pathname: "/dashboard",
            alias: "Dashboard"
        },
        polling: {
            pathname: "/polling",
            alias: "Rate Recipes"
        },
        profile: {
            pathname: "/profile",
            alias: "Profile"
        },
        logout: {
            pathname: "/logout",
            alias: "Logout"
        }
    }
};