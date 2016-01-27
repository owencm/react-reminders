(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var log = function log() {
  for (var _len = arguments.length, msgs = Array(_len), _key = 0; _key < _len; _key++) {
    msgs[_key] = arguments[_key];
  }

  console.log(msgs.map(JSON.stringify).join(' '));
};

Parse.Cloud.define('scheduleNotification', function (req, resp) {
  // let { startTime, data } = req.params;
  // log(req.body);
  // log('Scheduling a notification in response to ', req.body, 'to be shown at', startTime, 'and include', data);
  // TODO: write data somewhere
  // TODO: Schedule a notification

  var thisUserQuery = new Parse.Query(Parse.Installation);
  Parse.Push.send({
    where: thisUserQuery,
    data: {
      alert: "New Ticket Added",
      sound: "default"
    }
  }, {
    success: function success() {
      response.success('true');
    },
    error: function error(_error) {
      response.error(_error);
    }
  });
});

Parse.Cloud.define('setDeviceToken', function (req, resp) {
  var _req$params = req.params;
  var deviceToken = _req$params.deviceToken;
  var userId = _req$params.userId;

  Parse.Cloud.useMasterKey('tc5jozG8ZZZPbR1wFFNKDrAqnYejEqjMEIFVx2Ik');
  var user = new Parse.User();
  user.id = userId;
  var query = new Parse.Query(Parse.Installation);
  query.equalTo('user', user); // Match Installations with a pointer to this User
  query.find({
    success: function success(installations) {
      for (var i = 0; i < installations.length; ++i) {
        // Add the channel to all the installations for this user
        installations[i].set('deviceToken', deviceToken);
      }

      // Save all the installations
      Parse.Object.saveAll(installations, {
        success: function success(installations) {
          // All the installations were saved.
          response.success("All the installations were updated with new deviceTokens.");
        },
        error: function error(_error2) {
          // An error occurred while saving one of the objects.
          console.error(_error2);
          response.error("An error occurred while updating this user's installations.");
        }
      });
    },
    error: function error(_error3) {
      console.error(_error3);
      response.error("An error occurred while looking up this user's installations.");
    }
  });
});

Parse.Cloud.job('cronNotificationScheduler', function (req, status) {
  status.success('Job says Hello World!');
});

},{}]},{},[1]);
