'use strict';

import alarmManagerSw from './lib/alarm-manager-sw.js';

alarmManagerSw.addListener((data) => {
  const title = data.title;
  const body = data.body;
  const notificationOptions = {
      body: body,
      icon: 'icon.png',
      tag: title + body
  };
  console.log('Showing a notification');
  return self.registration.showNotification(title, notificationOptions);
});

// Library code

self.addEventListener('notificationclick', event => {
    const url = 'http://localhost:8080/';
    event.notification.close();
    event.waitUntil(clients.openWindow(url));
});
