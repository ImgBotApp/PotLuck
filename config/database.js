/**
 * Created by O on 10/13/2016.
 */
var dbURL = 'mongodb://localhost:27017/PotLuck';
var dbName = dbURL.split('/');

module.exports = {
    'name': dbName[dbName.length - 1],
    'url': dbURL
};