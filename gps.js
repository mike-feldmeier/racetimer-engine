var RESTART_DELAY = 10000;

var gpsd = require('./gpsd');

var listener = new gpsd.Listener({
  port: 2947,
  hostname: 'gps',
  logger: {
    info: console.log,
    warn: console.warn,
    error: console.error
  },
  parse: false
});

listener.connect();

listener.on('connected', function() {
  console.log('Event received: connected');
  listener.watch();
});

listener.on('disconnected', function(err) {
  console.log('Event received: disconnected');
  setTimeout(restartGps, RESTART_DELAY);
});

function restartGps() {
  console.log('Attempting to restart gps connection...');
  listener.connect();
}

module.exports = listener;
