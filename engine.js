var LAT_LONG_PLACES = 5;
var HOUR_IN_MILLISECONDS = 60 * 60 * 1000;

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/racetimer');

var gps = require('./gps');
var state = require('./state');
var Profile = require('./models/profile');

var moment = require('moment');
var haversine = require('haversine');

var events = require('events');
var eventEmitter = new events.EventEmitter();

gps.on('connected', function(data) {
	state.gps.connected = true;
	console.log('gps connected');
	eventEmitter.emit('data', state);
});

gps.on('disconnected', function(data) {
	state.gps.connected = false;
	console.log('gps disconnected');
	eventEmitter.emit('data', state);
});

gps.on('TPV', function(data) {
	if(moment(data.time) - 0 !== state.gps.time) {
		var lat = parseFloat((data.lat ? data.lat : 0).toFixed(LAT_LONG_PLACES));
		var lng = parseFloat((data.lon ? data.lon : 0).toFixed(LAT_LONG_PLACES));

		if(state.race.startsAt) {
			var now = moment(data.time) - 0;
			state.race.elapsed = now - state.race.startsAt;

			if(state.race.elapsed >= 0) {
				var ddiff = calculateDistance(state.gps.lat, state.gps.lng, lat, lng);

				state.race.distance += ddiff;
				state.race.instantSpeed = parseFloat((ddiff / ((now - state.gps.time) / HOUR_IN_MILLISECONDS)).toFixed(3));
				state.race.instantSum += state.race.instantSpeed;
				state.race.instantCount++;
				state.race.averageSpeed = parseFloat((state.race.instantSum / state.race.instantCount).toFixed(3));
			}
			else {
				state.race.instantSum = 0;
				state.race.instantCount = 0;
			}
		}

		state.gps.time = moment(data.time) - 0;
		state.gps.lat = lat;
		state.gps.lng = lng;
		state.gps.accuracy.time = data.ept;
		state.gps.accuracy.latm = data.epy;
		state.gps.accuracy.lngm = data.epx;

		console.log('gps data update');
		eventEmitter.emit('data', state);
	}
});

function start() {
	if(!state.race.startsAt) {
		state.race.startsAt = moment(state.gps.time).add(1, 'minute').startOf('minute') - 0;
		state.race.distance = 0;
	}
}

function stop() {
	state.race = {};
}

function listProfiles() {
	Profile.find({}, function(err, profiles) {
		if(err) throw err;
		eventEmitter.emit('profiles', profiles);
	});
}

function getProfile(id) {
	Profile.findById(id, function(err, profile) {
		if(err) throw err;
		eventEmitter.emit('profile', profile);
	});
}

function selectProfile(id) {
	Profile.findById(id, function(err, profile) {
		if(err) throw err;
		state.profile = profile;
	});
}

function saveProfileHeader(header) {
	var profile = new Profile();

	profile.name = header.name;
	profile.targetDistanceMiles = header.distance;
	profile.targetSpeed = header.speed;
	
	profile.save(function(err) {
		if(err) return err;
		console.log('Saved:');
		console.dir(profile);
	});
}

function calculateDistance(latA, lngA, latB, lngB) {
	var start = { latitude: latA, longitude: lngA };
	var stop = { latitude: latB, longitude: lngB };
	var mi = haversine(start, stop, { unit: 'mi' });
	return mi;
}

module.exports = {
	start: start,
	stop: stop,
	listProfiles: listProfiles,
	saveProfileHeader: saveProfileHeader,
	getProfile: getProfile,
	selectProfile: selectProfile,

	on: function(key, f) { eventEmitter.on(key, f); }
};