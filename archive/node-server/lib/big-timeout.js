var log = require('./conditional-log.js')(false);
var twoThirtyOne = Math.pow(2, 31);

// This takes a callback and delay and calls it after the right delay.
// It takes account of setTimeout only functioning for delay values < 2^31
var setBigTimeout = function(callback, delay) {
  var delayRemaining = 0;
  if (delay >= twoThirtyOne) {
    delayRemaining = delay - twoThirtyOne;
    setTimeout(function () {
      setBigTimeout(callback, delayRemaining);
    }, twoThirtyOne);
  } else {
    setTimeout(callback, delay);
  }
}

module.exports = setBigTimeout;
