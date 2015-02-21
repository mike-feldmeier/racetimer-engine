var engine = require('./engine');

var app = require('http').createServer();
var io = require('socket.io')(app);
app.listen(5000);

engine.on('data', function(data) {
	console.dir(data);
	io.sockets.emit('data', data);
});

engine.on('profiles', function(profiles) {
	console.dir(profiles);
	io.sockets.emit('profiles', profiles);
});

engine.on('profile', function(profile) {
	console.dir(profile);
	io.sockets.emit('profile', profile);
});

io.on('connection', function(socket) {
	socket.on('start', function(data) {
		engine.start();
	});

	socket.on('stop', function(data) {
		engine.stop();
	});

	socket.on('profiles', function(data) {
		engine.listProfiles();
	});

	socket.on('profile', function(data) {
		engine.getProfile(data.id);
	});

	socket.on('profile-header', function(data) {
		engine.saveProfileHeader(data);
	});

	socket.on('select-profile', function(data) {
		engine.selectProfile(data.id);
	});
});
