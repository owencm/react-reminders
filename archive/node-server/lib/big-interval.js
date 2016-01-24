var log = require('./conditional-log.js')(false);
var setBigTimeout = require('./big-timeout.js');

var setBigInterval = function (callback, interval, delay) {
  log('setBigInterval called with ', callback, interval, delay);
  var timeout = (delay > 0) ? delay : interval;
  // If there's no delay, set a timeout which recursively calls set interval
  // and the callback simultaneously
  setBigTimeout(function () {
    callback();
    setBigInterval(callback, interval);
  }, timeout);
}

module.exports = setBigInterval;
