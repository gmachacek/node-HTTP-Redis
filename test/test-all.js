/**
 * Unit tests Stability: 1 - Experimental
 */

// Imports
var server = require('../server');
var fs = require("fs");
var path = require("path");

// Global variables with initialization values
var logFileName = "queries.log";
var logFileDir = process.cwd();

function getLastLineFromLog() {
    var lines;
    try {
	var filename = path.join(logFileDir, logFileName);
	var data = fs.readFileSync(filename, 'utf8');
	lines = data.split("\n");
    } catch (err) {
	if (err) {
	    service.displayErrorMsg(err.name + ": " + err.message);
	}
	return false;
    }
    return lines[lines.length - 2];
}

exports['Test getQueryString()']  = {
    EmptyQueryString : function(test) {
	test.equal(server.getQueryString("http://127.0.0.1:1338/"), "");
	test.equal(server.getQueryString("http://127.0.0.1:1338/?"), "");
	test.equal(server.getQueryString("http://127.0.0.1:1338/a?"), "");
	test.equal(server.getQueryString("http://127.0.0.1:1338/#?asd"), "");
	test.done();
    },
    QueryStringParameter : function(test) {
	test.equal(server.getQueryString("http://127.0.0.1:1338/?f"), "f");
	test.equal(server.getQueryString("http://127.0.0.1:1338/?foo="), "foo=");
	test.equal(server.getQueryString("http://127.0.0.1:1338/?foo=&"), "foo=&");
	test.equal(server.getQueryString("http://127.0.0.1:1338/?foo=="), "foo==");
	test.equal(server.getQueryString("http://127.0.0.1:1338/?foo=&d="), "foo=&d=");
	test.done();
    },
    EncodedQueryStringParameter: function(test) {
	test.equal(server.getQueryString("http://127.0.0.1:1338/?foo=kůň"), "foo=kůň");
	test.done();
    },
    AnchorParameter: function(test) {
	test.equal(server.getQueryString("http://127.0.0.1:1338/?foo=5#d"), "foo=5");
	test.equal(server.getQueryString("http://127.0.0.1:1338/?foo=#&d"), "foo=");
	test.done();
    }
};

exports['Test saveData(): Comparing Encoded QueryString with previously value saved as JSON string'] = function(test) {
    test.expect(1);
    server.saveData("foo=kůň", function(err) {
	if (err) {
	    service.displayErrorMsg(err.stack);
	}
	test.equal(getLastLineFromLog(), JSON.stringify({
	    "foo" : "kůň"
	}));
	test.done();
    });
};

exports['Test getCountQueryParameter(): Well retrieving Count parameter'] = function(test) {
    test.equal(server.getCountQueryParameter("count="), 0);
    test.equal(server.getCountQueryParameter("count"), 0);
    test.equal(server.getCountQueryParameter("coun=5"), false);
    test.equal(server.getCountQueryParameter("count=5"), 5);
    test.throws(function() {
	server.getCountQueryParameter("count=e");
    });
    test.done();
};


