'use strict';

import model from './model.js';
import strings from './strings.js';

// App code

const getNotifications = () => {
  return new Promise((resolve, reject) => {
    model.init();
    // Hack to ensure todos are loaded. TODO: Fix me
    setTimeout(() => {
      let dueTodos = model.getDueTodos();
      let todo = dueTodos[0];
      let title = 'Aspire: Why not add a new aspiration today?';
      let body = '';
      if (todo) {
        title = `Apire: ${todo.title}`;
        let todoFrequencyAndLastDone = strings.todoFrequencyAndLastDone(
          todo.frequency,
          todo.lastDone
        );
        body = todoFrequencyAndLastDone;
      }
      const icon = 'TODO.png';
      const urlToOpen = 'http://www.google.com/'
      resolve([{title, body, icon, urlToOpen}]);
    }, 1000);
  });
}

// Library code

const showNotification = (title, body, icon, data) => {
    console.log('showNotification');
    const notificationOptions = {
        body: body,
        icon: icon,
        tag: 'static-yo',
        data: data
    };
    return self.registration.showNotification(title, notificationOptions);
}

self.addEventListener('push', event => {
    console.log('Received a push message', event);
    event.waitUntil(getNotifications().then((notifications) => {
        // TODO: Handle multiple notifications
        const notification = notifications[0];
        const notificationData = { url: notification.urlToOpen };
        return showNotification(notification.title, notification.body, notification.icon, notificationData);
    }).catch(err => {
        console.error('A Problem occured with handling the push msg', err);
        const title = 'An error occured';
        const message = '';
        return showNotification(title, message);
    }));
});

self.addEventListener('notificationclick', event => {
    const url = event.notification.data.url;
    event.notification.close();
    event.waitUntil(clients.openWindow(url));
});

// fetch(YAHOO_WEATHER_API_ENDPOINT).then(response => {
  // if (response.status !== 200) {
  //     // Throw an error so the promise is rejected and catch() is executed
  //     throw new Error(`Invalid status code from weather API: ${ response.status }`);
  // }
  // Examine the text in the response
//     return response.json();
// }).then(data => {
