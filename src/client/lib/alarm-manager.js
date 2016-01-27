// TODO: in initialization take an sender ID and add it to the sites manifest
// using the service worker

import Parse from 'parse';

Parse.initialize('ZqfKAmPjdMdNkzJV4ZAGZC2odz2BPjTaIlJRBeOF', 'e2VWvnFULHByDWnywBemHM4JhvKHmdrEuuKvtBJw');
window.Parse = Parse;

import pushWrapper from './push-wrapper.js';

import localforage from 'localforage';
const lf = localforage;

const subscribeWithParse = (deviceToken) => {
  let installation = new Parse.Installation;

  // For some reason we need to manually add this to the installation before
  // saving
  Parse._getInstallationId().then((installationId) => {
    lf.ready().then(() => lf.setItem('installationId', installationId));
    installation.set({
      deviceToken: deviceToken,
      pushType: 'gcm',
      deviceType: 'android',
      GCMSenderId: '70689946818',
      installationId: installationId
    });
    return installation.save();
  });
}

pushWrapper.getSubscription().then((subscription) => {
  if (subscription) {
    let endpoint = subscription.endpoint;
    let deviceToken = endpoint.slice(40, endpoint.length);
    subscribeWithParse(deviceToken);
  }
});

let queue = [];

pushWrapper.addSubscriptionChangeListener(flushQueue);

const flushQueueIfSubscriptionAvailable = () => {
  pushWrapper.getSubscription().then((subscription) => {
    if (subscription) {
      flushQueue(subscription);
    }
  });
}

flushQueueIfSubscriptionAvailable();

pushWrapper.hasPermission().then((permissionGranted) => {
  if (permissionGranted) {
    pushWrapper.subscribeDevice();
  }
});

// These will be sent when flushQueue is called, and they will have subscription
// added to body
const addToQueue = (newTask) => {
  // Clear tasks from the queue if they have the same taga
  queue = queue.filter((task) => {
    return task.tag !== newTask.tag;
  })
  queue.push(newTask);
  flushQueueIfSubscriptionAvailable();
}

const flushQueue = ({ endpoint }) => {
  for (let i = 0; i < queue.length; i++) {
    let task = queue[i];
    if (task.action === 'unset') {
      // TODO
    } else {
      // TODO: Write data to somewhere we can get to it
      Parse._getInstallationId().then((installationId) => {
        let pushData = new Parse.Object('PushData', {
          tag: task.tag,
          data: task.data,
          targetDeliveryTime: task.targetTime,
          installationId: installationId,
          delivered: false,
          received: false
        });
        pushData.save();
      });
    }
  }
  queue = [];
}

const set = (tag, targetTime, interval=-1, data) => {
  // Note the subscription ID gets added when the queue is flushed
  addToQueue({
    action: 'set',
    tag,
    targetTime,
    interval,
    data
  });
}

const unset = (tag) => {
  // Send to the server scheduling information, keyed by a device ID and the todo ID
  // so if the todo changes we can clear the previous schedule on the server
  // Note the subscription ID gets added when the queue is flushed
  addToQueue({
    action: 'unset',
    tag,
    deviceId
  });
}

const init = () => {
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

pushWrapper.getSubscription().then((sub) => { console.log(sub) });
