'use strict'

var restify   = require('restify');
var socketio  = require('socket.io');

var engine    = require('./engine');

var server    = restify.createServer();
var io        = socketio.listen(server.server);

server.use(restify.bodyParser());

server.get('/start', function(req, res, next) {
  console.log('server.js (/start)');
  engine.start();
  res.send(200);
  return next();
});

server.get('/stop', function(req, res, next) {
  console.log('server.js (/stop)');
  engine.stop();
  res.send(200);
  return next();
});

server.get('/speed/:speed', function(req, res, next) {
  engine.setTargetSpeed(req.params.speed);
  res.send(200);
  return next();
});

server.get('/distance/:distance', function(req, res, next) {
  engine.setTargetDistance(req.params.distance);
  res.send(200);
  return next();
});

io.sockets.on('connection', function(socket) {
  socket.emit('connected');
});

engine.on('state', function(state) {
  io.sockets.emit('state', state);
});

server.listen(4000, function() {
  console.log('Server listening at %s', server.url);
});
