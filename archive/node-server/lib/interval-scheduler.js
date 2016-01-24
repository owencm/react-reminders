var setBigInterval = require('./big-interval.js');
var setBigTimeout = require('./big-timeout.js');
var log = require('./conditional-log.js')(false);

// TODO: Maybe move to an indexed storage system so we can look up by tag faster
var storage = require('node-persist');
storage.initSync();

var SERIALIZED_INTERVALS = 'serialized-intervals';

// A map from serialized callbacks to the real callbacks, added via register()
var externalCallbacks = {};

// Users of the library call this each time the process is started so serialized
// timeouts know what callback to call (since you can't serialize callbacks)
var register = function (id, callback) {
  if (externalCallbacks[id]) {
    throw new Error ('Cannot register the same interval-scheduler ID twice');
  }
  externalCallbacks[id] = callback;
}

var callRegisteredCallback = function (externalId, callbackValue) {
  log('callRegisteredCallback', externalId, callbackValue);
  externalCallbacks[externalId](callbackValue);
}

var isIntervalActive = function (id) {
  return storage.getItem(SERIALIZED_INTERVALS)
           .filter(function(sInterval) {
             return sInterval.id === id;
           })
           .length > 0;
}

// This is the external entrypoint to this library
var setPersistentBigInterval = function (externalId,
                                         callbackValue,
                                         tag,
                                         interval,
                                         delay) {

  // Create a unique ID for this interval so if one is created with the same tag
  // we can recognize the one that should be de-activated
  var id = Math.random() + '' + Math.random();

  storeIntervalPersistently(id, externalId, callbackValue, tag, interval, delay);

  if (!externalCallbacks[externalId]) {
    console.log(externalCallbacks);
    throw new Error(`Forgot to register ${externalId} with interval-scheduler
                     before scheduling`);
  }

  setBigIntervalForSerializableCallback(id, externalId, callbackValue, tag, interval, delay);

}

var clearPersistentInterval = function(tag) {
  var serializedIntervals = storage.getItem(SERIALIZED_INTERVALS) || [];
  var newSerializedIntervals = serializedIntervals.filter(function(sInterval) {
    return (sInterval.tag !== tag);
  });
  if (newSerializedIntervals.length === serializedIntervals) {
    throw new Error(`No interval with tag ${tag} to clear`);
  }
  storage.setItem(SERIALIZED_INTERVALS, newSerializedIntervals);
}

var setBigIntervalForSerializableCallback = function (id,
                                                      externalId,
                                                      callbackValue,
                                                      tag,
                                                      interval,
                                                      delay) {

  setBigInterval(function () {
    if (isIntervalActive(id)) {
      callRegisteredCallback(externalId, callbackValue);
    }
  }, interval, delay);
}

var convertStartTimeAndIntervalToDelay = function (startTime, interval) {
  var now = Date.now();
  var delay = startTime - now;
  // If it was supposed to have already started, find the amount of time until
  // the next interval should have been
  if (delay < 0) {
    // Modulo of negative numbers is still negative, so add one more interval
    delay = delay % interval + interval;
  }
  return delay;
}

var storeIntervalPersistently = function (id, externalId, callbackValue, tag, interval, delay) {
  // Persist them on disk in terms of time setd to start, not delay from now
  var startTime = Date.now() + delay;
  var serializedIntervals = storage.getItem(SERIALIZED_INTERVALS) || [];
  // Make sure to replace intervals with the same tag
  serializedIntervals = serializedIntervals.filter(function(sInterval) {
    return (sInterval.tag !== tag);
  });
  serializedIntervals.push({id, externalId, callbackValue, tag, interval, startTime});
  storage.setItem(SERIALIZED_INTERVALS, serializedIntervals);
}

var restoreIntervals = function () {
  var serializedIntervals = storage.getItem(SERIALIZED_INTERVALS) || [];
  log('Recovered intervals', serializedIntervals);
  for (var i = 0; i < serializedIntervals.length; i++) {
    var sInterval = serializedIntervals[i];
    var delay = convertStartTimeAndIntervalToDelay(sInterval.startTime,
                                                   sInterval.interval);

    setBigIntervalForSerializableCallback(sInterval.id,
                                          sInterval.externalId,
                                          sInterval.callbackValue,
                                          sInterval.tag,
                                          sInterval.interval,
                                          delay);

  }
}

restoreIntervals();

module.exports = { register, setPersistentBigInterval, clearPersistentInterval };
