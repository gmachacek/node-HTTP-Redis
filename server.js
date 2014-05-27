/**
 * HTTP server Stability: 3 - Stable
 */

// --------------------------------------------------------------------------
// HTTP server serves four tasks as following:
// 1.přijme HTTP GET požadavek na routě /track
// 2.získá data předaná jako query string parametry volání
// 3.uloží data do souboru na lokálním disku jako JSON (append)
// 4.pokud se v datech vyskytuje parametr count, zvýší o jeho hodnotu položku s
// klíčem 'count' v databázi Redis
// --------------------------------------------------------------------------
//
// Exports
exports.start = serverStart;
exports.stop = serverStop;
exports.serverHost = serverHost;
exports.serverPort = serverPort;
exports.logFileName = logFileName;
exports.logFileDir = logFileDir;
exports.getQueryString = getQueryString;
exports.getCountQueryParameter = getCountQueryParameter;
exports.saveData = saveData;

// Imports
var http = require("http");
var url = require("url");
var util = require('util');
var fs = require("fs");
var path = require("path");
var querystring = require('querystring');
var redis = require("redis");
var service = require("./myServices");

// Global variables with initialization values
var serverHost = "127.0.0.1";
var serverPort = 1338;
var logFileName = "queries.log";
var logFileDir = process.cwd();
//var logFileDir = "./";
var redisDBPort = null;
var redisDBHost = null;
var httpServer;
var redisClient;
var isDebugMode = true;
var isTestMode = true;

// Entry point
if (!module.parent) {
    serverStart();
}

// Error handling
function asyncErrorHandler(err) {
    if (err) {
	service.displayErrorMsg(err.stack);
    }
}
function syncErrorHandler(err) {
    if (err) {
	service.displayErrorMsg(err.name + ": " + err.message);
    }
}
// --------------------------------------------------------------------------
// FUNCTION getQueryString
// Params: queryString as String
// Returns: URL Query String parameter as String, if error returns false
// Description:
// --------------------------------------------------------------------------
function getQueryString(uri) {

    var queryStringAsStr;
    try {
	queryStringAsStr = url.parse(uri).query;
	if (typeof (queryStringAsStr) == "string") {
	    return queryStringAsStr;
	} else {
	    return "";
	}

    } catch (err) {
	syncErrorHandler(err);
	return false;
    }
}

// --------------------------------------------------------------------------
// FUNCTION saveData()
// Params: queryString as String
// Returns: queryString formated as JSON String
// Description:
// --------------------------------------------------------------------------
// Get queryString parameter, converts it to JSON format and
// saves(appends) it to local file specified in global variables logFileDir,
// logFileName.
// --------------------------------------------------------------------------
function saveData(queryStringAsStr, callBack) {

    var queryStringAsObj = null;
    var queryStringAsJSON = "";
    var filename = "";
    
    try {
	queryStringAsObj = querystring.parse(queryStringAsStr);
	queryStringAsJSON = JSON.stringify(queryStringAsObj);
	filename = path.join(logFileDir, logFileName);
    } catch (err) {
	syncErrorHandler(err);
	return;
    }
    
    if (typeof (callBack) == "undefined")
	callBack = asyncErrorHandler;
    
    fs.appendFile(filename, queryStringAsJSON + "\n", callBack);
}

// --------------------------------------------------------------------------
// FUNCTION getCountQueryParameter()
// Params: queryString as String
// Returns: Count value as Number
// Throws: Raise Error when count value is NaN
// Description:
// --------------------------------------------------------------------------
// Get queryString parameter, tests on 'Count' parameter containing,
// if true then retrieves value as Number, otherwise return false.
// --------------------------------------------------------------------------
function getCountQueryParameter(queryStringAsStr) {

    var queryStringAsObj = null;
    var count = -1;

    queryStringAsObj = querystring.parse(queryStringAsStr.toLowerCase());
    if (typeof (queryStringAsObj.count) != "undefined") {
	count = Number(queryStringAsObj.count);
	if (isNaN(count)) {
	    throw new Error('Count parameter is not a number');
	} else {
	    return count;
	}
    } else {
	return false;
    }

}
// --------------------------------------------------------------------------
// FUNCTION updateCounter()
// Params: queryString as String
// Returns:
// Description:
// --------------------------------------------------------------------------
// When Count parameter exists in queryString, then 'count' item in Redis
// database will be incrementing by its value.
// --------------------------------------------------------------------------
function updateCounter(queryStringAsStr) {
    var count;
    try {
	count = getCountQueryParameter(queryStringAsStr);
    } catch (err) {
	syncErrorHandler(err);
	return;
    }

    if (typeof (count) == "number") {
	redisClient.INCRBY("count", count, asyncErrorHandler);
    }
}

// --------------------------------------------------------------------------
// FUNCTION processRequest()
// Params: request, response
// Returns:
// Description: HTTP process handler
// --------------------------------------------------------------------------
// 1.Handle GET request and always return HTTP '200' code.
// 2.Retrieve Query string
// 3.Not empty Query string saves as JSON string to local file (append)
// 4.In case when Query string containing Count parameter saves it to database
// Redis by incrementing previous value of 'count' key.
// Optionally sends message 'Process GET request ' with URL string to console.
// --------------------------------------------------------------------------
function processRequest(request, response) {

    var queryString = getQueryString(request.url);

    if (typeof (queryString) == "string" && queryString !== "") {
	saveData(queryString);
	updateCounter(queryString);
    }
    response.writeHead(200);
    response.end();
}

// --------------------------------------------------------------------------
// FUNCTION serverStart()
// Params:
// Returns:
// Description: Start HTTP server and session with Redis database
// --------------------------------------------------------------------------
// Instantiates HTTP server with global parameters serverPort, serverHost and
// set process handler. Also track 'close' and optionally 'request' event to
// console.
// Subsequently create session with Redis DB with global
// parameters redisDBPort, redisDBHost and follow 'error', 'connect',
// 'reconnecting' and 'end' events to console.
// Sends message 'HTTP server running at ' with serverPort, serverHost
// parameters to console.
// --------------------------------------------------------------------------
function serverStart() {
    // Init HTTP server
    httpServer = http.createServer(processRequest);
    httpServer.listen(serverPort, serverHost);

    httpServer.on("close", function() {
	service.displayMsg("Info: HTTP server is closed.");
    });
    if (isDebugMode) {
	httpServer.on("request", function(request, response) {
	    service.displayMsg("Info: Process GET request '" + request.url + "'");
	});
    }

    // Init Redis client
    redisClient = redis.createClient(redisDBPort, redisDBHost);

    redisClient.on("error", function(err) {
	service.displayErrorMsg(err.message);
    });
    redisClient.on("connect", function() {
	service.displayInfoMsg("Redis client is connected to Redis server.");
    });
    redisClient.on("reconnecting", function(msg) {
	service.displayInfoMsg("Redis server is connecting ... [" + msg.attempt + "]");
    });
    redisClient.on("end", function() {
	service.displayInfoMsg("Redis server connection is closed.");
    });

    // Message
    service.displayInfoMsg("HTTP server running at " + serverHost + ":" + serverPort);
}

// --------------------------------------------------------------------------
// FUNCTION serverStop()
// Params:
// Returns:
// Description: Stop HTTP server and session with Redis database and let you
// know to console.
// --------------------------------------------------------------------------
function serverStop() {
    service.displayInfoMsg("HTTP Server stopping ...");
    httpServer.close();
    redisClient.quit();
}
