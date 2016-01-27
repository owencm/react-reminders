(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Parse.Cloud.job('cronNotificationScheduler', function (req, status) {
  // Todo: remove duplicates

  var now = new Date();
  var scheduledPushesQuery = new Parse.Query('PushData');
  // .lessThan('targetDeliveryTime', now)
  // .equalTo('delivered', false);

  scheduledPushesQuery.each(function (pushData) {
    console.log("Planning on sending a push to installationId:");
    console.log(pushData.get('installationId'));
    var installationQuery = new Parse.Query(Parse.Installation).equalTo('installationId', pushData.get('installationId'));
    Parse.Push.send({
      where: installationQuery,
      data: {}
    }, {
      success: function success() {
        pushData.set('delivered', true);
        pushData.save();
        console.log('sent a notification');
      },
      error: function error(_error) {
        console.error(_error);
      }
    });
  });
});

},{}]},{},[1]);
