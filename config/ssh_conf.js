/**
 * Created by O on 11/11/2016.
 */
var client = require('tunnel-ssh');
module.exports = {
    username: 'root',
    host: '162.243.2.42',
    port: 22,
    dstHost: '127.0.0.1',
    dstPort: 27017,
    localHost: '127.0.0.1',
    localPort: 27000,
    keepAlive: true
};