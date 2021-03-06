// The event system was awkward. I often wanted just to query "can I do this?"
// then do it, and use promises to know what happens

import PushClient from './push-client.js';

let pushClient;
let stateChangeListeners = [];
let subscriptionChangeListeners = [];

let stateChangeListener = (state, data) => {
  stateChangeListeners.map((listener) => listener(state, data));
};

let subscriptionChangeListener = (newSubscription) => {
  subscriptionChangeListeners.map((listener) => listener(newSubscription));
}

// Initialize
pushClient = new PushClient(
  stateChangeListener,
  subscriptionChangeListener
);

const addStateChangeListener = (listener) => {
  stateChangeListeners.push(listener);
}

const addSubscriptionChangeListener = (listener) => {
  subscriptionChangeListeners.push(listener);
}

// let subscriptionUpdateListener = (newSubscription) => {
//   console.log('subscriptionUpdate: ', newSubscription);
//   if (!newSubscription) {
//     // Remove any subscription from your servers if you have
//     // set it up.
//     return;
//   }
// };


const subscribeDevice = () => {
  return new Promise((resolve, reject) => {
    // Note these stay in stateChangeListener and will try to resolve many times.
    // TODO: Try to find a nicer solution
    stateChangeListeners.push((state, data) => {
      if (state.id === 'PERMISSION_GRANTED' || state.id === 'SUBSCRIBED') {
        resolve();
      } else if (state.id === 'PERMISSION_DENIED') {
        reject();
      }
    });
    pushClient.subscribeDevice();
  });
};

const getSubscription = () => {
  return pushClient.getSubscription();
}

const hasPermission = () => {
  return navigator.permissions.query({name: 'push', userVisibleOnly: true})
  .then((permissionState) => {
    return permissionState.state === 'granted';
  });
}

module.exports =  {
                    subscribeDevice,
                    getSubscription,
                    addStateChangeListener,
                    addSubscriptionChangeListener,
                    hasPermission
                  };
