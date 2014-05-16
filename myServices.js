/**
 * Service module
 */

// Exports
exports.getTime = getTime;
exports.displayMsg = displayMsg;
exports.displayInfoMsg = displayInfoMsg;
exports.displayErrorMsg = displayErrorMsg;

// Returns current Time in 'hh:mm:ss' format
function getTime() {
    return (new Date()).toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1");
}

// Send message text to console as following '[hh:mm:ss] {message}'
function displayMsg(msg) {
    console.log("[%s] %s", getTime(), msg);
}
// Send Info Message text to console as following '[hh:mm:ss] INFO: {message}'
function displayInfoMsg(msg) {
    console.info("[%s] INFO: %s", getTime(), msg);
}
// Send Error Message text to console as following '[hh:mm:ss] {message}'
function displayErrorMsg(msg) {
    console.error("[%s] ERROR: %s", getTime(), msg);
}
