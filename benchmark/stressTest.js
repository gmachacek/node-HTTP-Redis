/**
 * Other tests
 */

// Imports
var http = require("http");
var myServer = require("../server");
var myService = require("../myServices");

function test1Start() {
    myService.displayMsg("TEST: Test1 start");
    myServer.start();

}

function test1Process() {
    myService.displayMsg("TEST: Test1 process ...");
    http.get("http://" + myServer.serverIP + ":" + myServer.serverPort, function(res) {
	console.log("Got response: " + res.statusCode);
    }).on('error', function(e) {
	console.log("Got error: " + e.message);
    });

}

function test1End() {
    myServer.displayMsg("TEST: Test1 end");
    myServer.stop();

}

test1Start();
// setTimeout(test1Process, 5000);
// setTimeout(test1End, 10000);

