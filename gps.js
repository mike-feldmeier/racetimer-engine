var gpsd = require('node-gpsd');

var listener = new gpsd.Listener({
  port: 2947,
  hostname: 'gps',
  parse: false // true
});

listener.connect(function() {
  console.log('gps connected');
  listener.watch();
});

module.exports = listener;
