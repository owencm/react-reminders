import { getDeviceId } from './device-id.js';
import PushClient from './push-client.js';

let key;
let queuedRequests = [];

let pushClient = new PushClient(
  () => {},
  (subscription) => {
    if (subscription) {
      flushQueue(subscription);
    }
  }
);

let flushQueueIfSubscriptionAvailable = () => {
  pushClient.getSubscription().then((subscription) => {
    if (subscription) {
      flushQueue(subscription.endpoint);
    }
  });
}

flushQueueIfSubscriptionAvailable();

// These will be sent when flushQueue is called, and they will have subscription
// added to body
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
  }).then((resp) => { console.log(resp) })
}

const set = (tag, targetTime, interval) => {
  if (key === undefined) {
    throw new Error(`You must initialize alarm-manager with an API key before
      calling set.`)
  }
  // Send to the server scheduling information, keyed by a device ID and the todo ID
  // so if the todo changes we can clear the previous schedule on the server
  getDeviceId().then((deviceId) => {
    // Note the subscription ID gets added when the queue is flushed
    addToQueue('/v1/set', {
      key: key,
      tag: tag + '.' + deviceId,
      targetTime,
      interval
    });
  });
}

const init = (aPIKey) => {
  key = aPIKey;
}

module.exports = { set, init };
