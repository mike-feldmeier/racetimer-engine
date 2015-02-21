var mongoose = require('mongoose');

var schema = new mongoose.Schema({
	name: { type: String, required: true },
	targetDistanceMiles: { type: Number },
	targetSpeed: { type: Number },
	path: [{
		lat: { type: Number, required: true },
		lng: { type: Number, required: true }
	}]
});

module.exports = mongoose.model('profiles', schema);