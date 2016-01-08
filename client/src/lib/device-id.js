import localforage from 'localforage';
const lf = localforage;

const getDeviceId = () => {
  return lf.ready()
    .then(() => lf.getItem('deviceId'))
    .then((id) => {
      // If we've never created one before, create it and return it
      if (id === null) {
        let randId = Math.random() + '';
        lf.setItem('deviceId', randId).then(() => {
          return randId;
        });
      } else {
        return lf.getItem('deviceId');
      }
    });
}

module.exports = { getDeviceId }
