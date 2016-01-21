var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
var scheduler = require('./lib/interval-scheduler.js');
var gcm = require('node-gcm');

// Scheduling
var notifyClientAboutTodo = function (subscription) {
  console.log('Time to ping', subscription);
  var sender = new gcm.Sender(subscription.key);
  var message = new gcm.Message();
  var regTokens = [subscription.endpoint.slice(40, subscription.endpoint.length)];
  sender.send(message, { registrationTokens: regTokens }, function(err, response) {
    if (err) {
      console.log(err);
    } else {
      console.log(response);
    }
  })
}

scheduler.register('todo-caller', notifyClientAboutTodo);

// Server

app.use(express.static('../client/build'));

app.use(bodyParser.json()); // for parsing application/json

app.post('/v1/set', jsonParser, function (req, res) {
  console.log('Update came:', req.body);
  var tag = req.body.tag;
  var interval = req.body.frequency;
  var delay = req.body.targetTime - Date.now();
  // var interval = req.body.interval;
  // var delay = req.body.delay;
  var interval = 5000;
  var delay = 1000;
  var endpoint = req.body.subscription;
  var key = req.body.key;
  scheduler.setPersistentBigInterval('todo-caller', {endpoint, key}, tag, interval, delay);
  res.sendStatus(200);
});

var server = app.listen(8080, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Listening at http://%s:%s', host, port);
});
