var Service = require('node-windows').Service;
var path = require('path');

var svc = new Service({
	name: 'Racetimer Engine',
	description: 'Racetimer Engine Service',
	script: path.join(__dirname, 'server.js')
});

svc.on('install', function() {
	svc.start();
});

svc.install();