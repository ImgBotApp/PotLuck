/**
 * Created by O on 10/21/2016.
 */

exports.routes_list = {
    // Routes Table

    // Social
    auth_facebook: {
        pathname: "/auth/facebook",
        alias: "Facebook"
    },
    auth_github: {
        pathname: "auth/github",
        alias: "GitHub"
    },
    auth_google: {
        pathname: "/auth/google",
        alias: "Google"
    },
    auth_twitter: {
        pathname: "/auth/twitter",
        alias: "Twitter"
    },
    connect_local: {
        pathname: "/connect/local",
        alias: "Local"
    },
    connect_facebook: {
        pathname: "/connect/facebook",
        alias: "Facebook"
    },
    connect_github: {
        pathname: "/connect/github",
        alias: "GitHub"
    },
    connect_google: {
        pathname: "/connect/google",
        alias: "Google"
    },
    connect_twitter: {
        pathname: "/connect/twitter",
        alias: "Twitter"
    },
    unlink_local: {
        pathname: "/unlink/local",
        alias: "Local"
    },
    unlink_facebook: {
        pathname: "/unlink/facebook",
        alias: "Facebook"
    },
    unlink_github: {
        pathname: "/unlink/github",
        alias: "GitHub"
    },
    unlink_google: {
        pathname: "/unlink/google",
        alias: "Google"
    },
    unlink_twitter: {
        pathname: "/unlink/twitter",
        alias: "Twitter"
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