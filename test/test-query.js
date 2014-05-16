/**
 * Unit tests
 * Stability: 1 - Experimental
 */
var server = require('../server');

exports.getQueryString = function (test) {
    test.equal(server.getQueryString("http://127.0.0.1:1338/?foo=6"), "foo=5");
    test.done();
};