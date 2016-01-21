var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
var scheduler = require('./lib/interval-scheduler.js');

// Scheduling
var notifyClientAboutTodo = function (subId) {
  console.log('Time to ping', subId);
}

scheduler.register('todo-caller', notifyClientAboutTodo);

// Server

app.use(express.static('../client/build'));

app.use(bodyParser.json()); // for parsing application/json

app.post('/schedule', jsonParser, function (req, res) {
  console.log('Update came:', req.body);
  var todoId = `todo-${req.body.id}`;
  var interval = req.body.frequency;
  var delay = req.body.targetTime - Date.now();
  var interval = 5000;
  var delay = 2000;
  var subId = req.body.subscription;
  scheduler.setPersistentBigInterval('todo-caller', subId, todoId, interval, delay);
  res.sendStatus(200);
});

var server = app.listen(8080, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Listening at http://%s:%s', host, port);
});
