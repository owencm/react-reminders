var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
var scheduler = require('./lib/interval-scheduler.js');
var gcm = require('node-gcm');
var path = require("path");
var storage = require('node-persist');
storage.initSync();

var ttlMilis = 86400000;
var send = true;

var getDataListByDeviceId = function (deviceId) {
  var dataAndTimestamps = storage.getItem(deviceId) || [];
  // TODO: filter out data that is > ttl old
  // dataAndTimestamps.filter
  return dataAndTimestamps;
}

var getOldestDataByDeviceIdAndRemoveFromStorage = function (deviceId) {
  var dataAndTimestamps = getDataListByDeviceId(deviceId);
  var oldestDataAndTimeStamp = {data: null, timestamp: -1};
  var newDataAndTimestamps = [];
  for (var i = 0; i < dataAndTimestamps.length; i++) {
    var dataAndTimeStamp = dataAndTimestamps[i];
    if (dataAndTimeStamp.timestamp > oldestDataAndTimeStamp.timestamp) {
      if (oldestDataAndTimeStamp.timeout !== -1) {
        newDataAndTimestamps.push(oldestDataAndTimeStamp);
      }
      oldestDataAndTimeStamp = dataAndTimeStamp;
    } else {
      newDataAndTimestamps.push(dataAndTimeStamp);
    }
  }
  storage.setItem(deviceId, newDataAndTimestamps);
  return oldestDataAndTimeStamp.data;
}

var storeDataByDeviceId = function (data, deviceId) {
  var dataAndTimestamps = getDataListByDeviceId(deviceId);
  dataAndTimestamps.push({data, timestamp: Date.now()});
  storage.setItem(deviceId, dataAndTimestamps);
}

// Scheduling
var notifyClient = function (meta) {
  var subscription = meta.subscription;
  var endpoint = subscription.endpoint;
  var regToken = endpoint.slice(40, endpoint.length);
  var deviceId = meta.deviceId;
  // Obtain the tag so if the subscription is no longer valid we can clear the
  // interval
  var tag = meta.tag;
  // This data should be stored so when the client receives the push it can be
  // fetched
  var data = meta.data;
  storeDataByDeviceId(data, deviceId);
  console.log('Pinging', subscription, 'with data', data);
  if (send) {
    // send = false;
    var sender = new gcm.Sender(subscription.key);
    var message = new gcm.Message();
    var regTokens = [regToken];
    sender.send(message, { registrationTokens: regTokens }, function(err, response) {
      if (err) {
        console.log(err);
      } else {
        console.log(response);
      }
    });
  }
}

scheduler.register('todo-caller', notifyClient);

// Server

app.set('port', process.env.PORT || 8080);

app.use(express.static(path.join(__dirname,'../', 'client/build')));

app.use(bodyParser.json()); // for parsing application/json

app.post('/v1/set', jsonParser, function (req, res) {
  console.log('Update came:', req.body);
  // Get the deviceId so when the client tries to fetch the data we know what
  // to provide
  var deviceId = req.body.deviceId;
  // Get the tag so we can replace older persisted intervals
  var tag = req.body.tag + deviceId;
  var interval = req.body.frequency;
  var delay = req.body.targetTime - Date.now();
  var interval = req.body.interval;
  var delay = req.body.delay;
  // For testing:
  // var interval = 5000;
  // var delay = 1000;
  // Get the endpoint and key so we know how to push the client
  var endpoint = req.body.subscription;
  var key = req.body.key;
  // Get the data so we know what to serve back to the client when the push is
  // received
  var data = req.body.data;
  scheduler.setPersistentBigInterval('todo-caller', {
    subscription: {endpoint, key},
    tag,
    deviceId,
    data
  }, tag, interval, delay);
  res.sendStatus(200);
});

app.get('/v1/get/:deviceId', function (req, res) {
  var deviceId = req.params.deviceId;
  res.send(JSON.stringify(getOldestDataByDeviceIdAndRemoveFromStorage(deviceId)));
})

var server = app.listen(app.get('port'), function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Listening at http://%s:%s', host, port);
});
