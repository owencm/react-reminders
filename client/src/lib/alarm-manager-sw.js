import { getDeviceId } from './device-id.js';

let listeners = [];

const addListener = (callback) => {
  listeners.push(callback);
}

const notifyListeners = (data) => {
  listeners.map(listener => listener(data));
}

self.addEventListener('push', event => {
    console.log('Received a push message', event);
    getDeviceId().then((deviceId) => {
      return fetch(`v1/get/${deviceId}`);
    }).then((resp) => {
      if (resp.status !== 200) {
        throw new Error('Could not ping alarm server');
      }
      return resp.json();
    }).then((data) => {
      notifyListeners(data);
    });
});

module.exports = { addListener }
