var state = {
	race: {
		
	},
	gps: {
		connected: false,
		time: 0,
		lat: 0,
		lng: 0,
		accuracy: {
			time: 0,
			latm: 0,
			lngm: 0
		}
	},
	profile: {
		name: null,
		data: {}
	}
};

module.exports = state;