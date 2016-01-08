var logging = false;
var log = function () {
  if (logging) {
    console.log.apply(console, arguments);
  }
}

var callbacks = {};

// Users of the library call this each time the process is started so serialized
// timeouts know what callback to call (since you can't serialize callbacks)
var register = function (id, callback) {
  if (callbacks[id]) {
    throw new Error ('Cannot register the same interval-scheduler ID twice');
  }
  callbacks[id] = callback;
}

var callRegisteredCallback = function (id, callbackValue) {
  log('callRegisteredCallback', id, callbackValue);
  callbacks[id](callbackValue);
}

// This takes a list of serializable callbacks and calls them
var callMultiple = function (callbacks) {
  log('callMultiple',callbacks);
  for (var i = 0; i < callbacks.length; i++) {
    var callback = callbacks[i];
    callRegisteredCallback(callback.callbackId, callback.callbackValue);
  }
}
register('call-multiple', callMultiple);

// This takes a serializable callback and delay and calls it after the right delay
// It takes account of setTimeout only functioning for delay values < 2^31
var twoThirtyOne = Math.pow(2, 31);
var scheduleBigTimeout = function (options) {
  log('scheduleBigTimeout called with options', options);
  var callbackId = options.callbackId;
  var callbackValue = options.callbackValue;
  var delay = options.delay;
  var scheduleInner = function(callbackId, callbackValue, delay) {
    var delayRemaining = 0;
    if (delay >= twoThirtyOne) {
      delayRemaining = delay - twoThirtyOne;
      setTimeout(function () {
        scheduleInner(callbackId, callbackValue, delayRemaining);
      }, twoThirtyOne);
    } else {
      // TODO: persist me
      setTimeout(function () {
        callRegisteredCallback(callbackId, callbackValue);
      }, delay);
    }
  }
  scheduleInner(callbackId, callbackValue, delay);
}
register('schedule-big-timeout', scheduleBigTimeout);

// This takes a serializable callback, interval and delay
var scheduleBigInterval = function (options) {
  log('scheduleBigInterval called with ',options);
  var callbackId = options.callbackId;
  var callbackValue = options.callbackValue;
  var interval = options.interval;
  var delay = options.delay;
  if (delay > 0) {
    scheduleBigTimeout({
      callbackId: 'schedule-big-interval',
      callbackValue: {
        callbackId: callbackId,
        callbackValue: callbackValue,
        interval: interval,
        delay: 0
      },
    delay: delay});
  } else {
    // If there's no delay, set a timeout which recursively calls set interval
    // and the callback simultaneously
    scheduleBigTimeout({
      callbackId: 'call-multiple',
      callbackValue: [{
        callbackId: 'schedule-big-interval',
        callbackValue: {
          callbackId: callbackId,
          callbackValue: callbackValue,
          interval: interval
        }
      }, {
        callbackId: callbackId,
        callbackValue: callbackValue
      }],
      delay: interval
    });
  }
}
register('schedule-big-interval', scheduleBigInterval);

// This takes a serializable callback, interval and delay
var schedulePersistentBigInterval = function (callbackId, callbackValue, interval, delay) {
  if (!callbacks[callbackId]) {
    throw new Error(`Forgot to register ${callbackId} with interval-scheduler before scheduling`);
  }
  scheduleBigInterval({callbackId, callbackValue, interval, delay});
}

module.exports = { register, schedulePersistentBigInterval };
