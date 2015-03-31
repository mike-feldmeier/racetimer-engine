var HOUR_MILLISECONDS = 60 * 60 * 1000;
var LATLNG_PLACES = 5;

var events    = require('events');

var haversine = require('haversine');
var moment    = require('moment');

var gps       = require('./gps');
var state     = require('./state');

var eventEmitter = new events.EventEmitter();

gps.on('error', function(err) {
  console.dir(err);

  console.log('Attempting to restart gps connection...');
  gps.disconnect();
  gps.connect(function() {
    gps.watch();
    console.log('GPS connection restarted.');
  });
});

gps.on('raw', function(raw) {
  try {
    var message = JSON.parse(raw);

    if(message.class === 'TPV') {
      var tpv = {
        lat:  message.lat,
        lon:  message.lon,
        time: message.time,
        ept:  message.ept,
        epx:  message.epx,
        epy:  message.epy,
      };

      if(!isDuplicate(tpv)) {
        updateGps(tpv);

        if(state.race.begins > 0 && state.gps.current.ts >= state.race.begins) {
          updateTrack();
        }

        console.log(state);
        eventEmitter.emit('state', state);
      }
    }
  }
  catch(err) {
    console.dir(err);
  }
});

function updateGps(tpv) {
  state.gps.previous = JSON.parse(JSON.stringify(state.gps.current));

  if(tpv.lat && tpv.lon && tpv.time) {
    state.gps.current.lat = parseFloat(tpv.lat.toFixed(LATLNG_PLACES));
    state.gps.current.lng = parseFloat(tpv.lon.toFixed(LATLNG_PLACES));
    state.gps.current.ts  = moment(tpv.time).valueOf();
  }

  if(tpv.epy && tpv.epx && tpv.ept) {
    state.gps.current.err.lat = parseFloat(tpv.epy.toFixed(LATLNG_PLACES));
    state.gps.current.err.lng = parseFloat(tpv.epx.toFixed(LATLNG_PLACES));
    state.gps.current.err.ts  = tpv.ept;
    }
}

function updateTrack() {
  state.race.elapsed.count++;

  if(state.gps.previous.ts !== 0) {
    var deltaD = haversine(
      { latitude: state.gps.previous.lat, longitude: state.gps.previous.lng },
      { latitude: state.gps.current.lat, longitude: state.gps.current.lng },
      { unit: 'mile' }
    );
    var deltaT = state.gps.current.ts - state.gps.previous.ts;

    var mph = parseFloat((deltaD / (HOUR_MILLISECONDS / deltaT)).toFixed(3));

    state.race.instant = mph;
    state.race.average = parseFloat(((state.race.average + mph) / 2).toFixed(3));
    state.race.elapsed.distance = parseFloat((state.race.elapsed.distance + deltaD).toFixed(3));
    state.race.elapsed.duration += deltaT;

    // calculate offset
    state.race.remaining.duration = state.race.target.duration - state.race.elapsed.duration;
    state.race.remaining.distance = state.race.target.distance - state.race.elapsed.distance;
    var remainingSpeed = (state.race.remaining.distance / (state.race.remaining.duration / HOUR_MILLISECONDS));
    state.race.remaining.offset = (remainingSpeed - state.race.instant).toFixed(3);
  }
}

function isDuplicate(tpv) {
  return state.gps.current.ts === moment(tpv.time).valueOf();
}

function start() {
  console.log('engine.js (/start)');
  state.race.begins = moment().add(1, 'minute').seconds(0).milliseconds(0).valueOf();
}

function stop() {
  console.log('engine.js (/stop)');  
  state.race.begins = 0;
  state.race.elapsed.distance = 0;
  state.race.elapsed.duration = 0;
  state.race.elapsed.count = 0;
}

function setTargetSpeed(speed) {
  state.race.target.speed = speed;
  state.race.target.duration = (state.race.target.distance / state.race.target.speed) * 60 * 60 * 1000;
}

function setTargetDistance(distance) {
  state.race.target.distance = distance;
  state.race.target.duration = (state.race.target.distance / state.race.target.speed) * 60 * 60 * 1000;
}

module.exports = {
  start: start,
  stop: stop,
  setTargetSpeed: setTargetSpeed,
  setTargetDistance: setTargetDistance,

  on: function(key, f) { eventEmitter.on(key, f); }
};
