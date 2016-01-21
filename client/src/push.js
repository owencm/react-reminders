// The event system was awkward. I often wanted just to query "can I do this?"
// then do it, and use promises to know what happens

import PushClient from './lib/push-client.js';

let pushClient;
let stateChangeListeners = [];

stateChangeListeners.push((state, data) => {
  console.log(state);
  if (typeof(state.interactive) !== 'undefined') {
    if (state.interactive) {

    }
  }

  if (typeof(state.pushEnabled) !== 'undefined') {
    if (state.pushEnabled) {

    }
  }

  switch (state.id) {
    case 'ERROR':
      console.error(data);
      showErrorMessage(
        'Ooops a Problem Occurred',
        data
      );
      break;
    default:
      break;
  }
});

const init = () => {
    let stateChangeListener = (state, data) => {
    stateChangeListeners.map((listener) => listener(state, data));
  };

  let subscriptionUpdate = (newSubscription) => {
    console.log('subscriptionUpdate: ', newSubscription);
    if (!newSubscription) {
      // Remove any subscription from your servers if you have
      // set it up.
      return;
    }
  };

  pushClient = new PushClient(
    stateChangeListener,
    subscriptionUpdate
  );
}

const subscribeDevice = () => {
  return new Promise((resolve, reject) => {
    let promiseComplete = false;
    pushClient.subscribeDevice();
    stateChangeListeners.push((state, data) => {
      if (!promiseComplete) {
        if (state.id === 'PERMISSION_GRANTED') {
          resolve();
          promiseComplete = true;
        } else if (state.id === 'PERMISSION_DENIED') {
          reject();
          promiseComplete = true;
        }
      }
    });
  });
};

module.exports = {init, subscribeDevice};
