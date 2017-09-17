/**
 * Created by O on 10/13/2016.
 */
const dbURL = process.env.MONGODB_URI;
const dbName = dbURL.split('/');

module.exports = {
    'name': dbName[dbName.length - 1],
    'url': dbURL
};