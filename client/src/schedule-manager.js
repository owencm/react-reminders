import { getDeviceId } from './lib/device-id.js';
import PushClient from './lib/push-client.js';

let queuedRequests = [];

let pushClient = new PushClient(
  () => {},
  (subscription) => {
    if (subscription) {
      flushQueue(subscription);
    }
  }
);

pushClient.getSubscription().then((subscription) => {
  if (subscription) {
    flushQueue(subscription);
  }
});

// These will be sent when flushQueue is called, and they will have subscription
// added to body
const addToQueue = (path, body) => {
  queuedRequests.push({path, body});
  pushClient.getSubscription().then((subscription) => {
    if (subscription) {
      flushQueue(subscription);
    }
  });
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

const listener = (todos, dueTodos, futureTodos) => {
  // Send to the server scheduling information, keyed by a device ID and the todo ID
  // so if the todo changes we can clear the previous schedule on the server
  getDeviceId().then((deviceId) => {
    for (let i = 0; i < todos.length; i++) {
      let todo = todos[i];
      let interval = todo.interval * 24*60*60*1000;
      let targetTime = todo.lastDone + interval;
      let tag = `todoId:${todo.id}, deviceId:${deviceId}`;
      addToQueue('schedule', { tag, targetTime, interval });
    }
  })
}

module.exports = listener;
