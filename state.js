module.exports = {
  gps: {
    current: {
      lat: 0,
      lng: 0,
      ts: 0,
      err: {
        lat: 0,
        lng: 0,
        ts: 0
      }
    },
    previous: {
      lat: 0,
      lng: 0,
      ts: 0,
      err: {
        lat: 0,
        lng: 0,
        ts: 0
      }
    }
  },
  race: {
    begins: 0,
    average: 0,
    instant: 0,
    elapsed: {
      distance: 0,
      duration: 0,
      count: 0
    },
    remaining: {
      distance: 0,
      duration: 0,
      offset: 0
    },
    target: {
      speed: 150,
      distance: 90,
      duration: 2160000
    }
  }
};
