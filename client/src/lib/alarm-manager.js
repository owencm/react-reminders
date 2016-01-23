// TODO: in initialization take an sender ID and add it to the sites manifest
// using the service worker

import { getDeviceId } from './device-id.js';
import pushWrapper from './push-wrapper.js';

let key;
let queuedRequests = [];

let flushQueueIfSubscriptionAvailable = () => {
  pushWrapper.getSubscription().then((subscription) => {
    if (subscription) {
      flushQueue(subscription.endpoint);
    }
  });
}

pushWrapper.addSubscriptionChangeListener(flushQueueIfSubscriptionAvailable);
pushWrapper.hasPermission().then((permissionGranted) => {
  if (permissionGranted) {
    pushWrapper.subscribeDevice();
  }
});
flushQueueIfSubscriptionAvailable();

// These will be sent when flushQueue is called, and they will have subscription
// added to body
// TODO: clobber queued requests with the same tag
const addToQueue = (path, body) => {
  queuedRequests.push({path, body});
  flushQueueIfSubscriptionAvailable();
}

const flushQueue = (subscription) => {
  for (let i = 0; i < queuedRequests.length; i++) {
    let req = queuedRequests[i];
    req.body.subscription = subscription;
    sendToServer(req.path, req.body);
  }
  queuedRequests = [];
}

const sendToServer = (path, body) => {
  fetch(path, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: new Headers({'Content-Type': 'application/json'})
  }).then((resp) => { console.log('Server responded:', resp) })
}

const set = (tag, targetTime, interval, data) => {
  if (key === undefined) {
    throw new Error(`You must initialize alarm-manager with an API key before
      calling set.`)
  }
  // Send to the server scheduling information, keyed by a device ID and the todo ID
  // so if the todo changes we can clear the previous schedule on the server
  getDeviceId().then((deviceId) => {
    // Note the subscription ID gets added when the queue is flushed
    addToQueue('/v1/set', {
      key,
      tag,
      deviceId,
      targetTime,
      interval,
      data
    });
  });
}

const unset = (tag) => {
  // Send to the server scheduling information, keyed by a device ID and the todo ID
  // so if the todo changes we can clear the previous schedule on the server
  getDeviceId().then((deviceId) => {
    // Note the subscription ID gets added when the queue is flushed
    addToQueue('/v1/unset', {
      tag,
      deviceId
    });
  });
}

const init = (aPIKey) => {
  key = aPIKey;
  // TODO: dim the screen at this point
  pushWrapper.hasPermission().then((permissionEnabled) => {
    if (permissionEnabled) {
      pushWrapper.subscribeDevice();
    }
  });
}

const requestPermission = pushWrapper.subscribeDevice;

const hasPermission = pushWrapper.hasPermission;

module.exports = { set, unset, init, requestPermission, hasPermission };
