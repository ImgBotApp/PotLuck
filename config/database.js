/**
 * Created by O on 10/13/2016.
 */
const dbURL = 'mongodb://localhost:27017/PotLuck';
const dbName = dbURL.split('/');

module.exports = {
    'name': dbName[dbName.length - 1],
    'url': dbURL
};