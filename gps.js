var gpsd = require('node-gpsd');
var gpsdListener = new gpsd.Listener({
	port: 2947,
	hostname: 'localhost'
});

gpsdListener.connect();
gpsdListener.watch();

module.exports = gpsdListener;