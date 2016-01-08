var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
var intervalScheduler = require('./lib/interval-scheduler.js');

// Scheduling
var notifyClientAboutTodo = function (todoId) {
  console.log('Time to send todo', todoId);
}

intervalScheduler.register('todo-caller', notifyClientAboutTodo);

var schedulePersistentBigInterval = intervalScheduler.schedulePersistentBigInterval;
schedulePersistentBigInterval('todo-caller', 0, 1000, 0);

// Server

app.use(express.static('../client/build'));

app.use(bodyParser.json()); // for parsing application/json

app.post('/schedule', jsonParser, function (req, res) {
  // console.log('Update came:', req.body);
  res.sendStatus(200);
});

var server = app.listen(8080, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Listening at http://%s:%s', host, port);
});
