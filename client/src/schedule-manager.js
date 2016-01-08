import { getDeviceId } from './lib/device-id.js';

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
      let frequency = todo.frequency * 24*60*60*1000;
      let targetTime = todo.lastDone + frequency;
      let id = `todoId:${todo.id}, deviceId:${deviceId}`;
      sendToServer('schedule', { id, targetTime, frequency });
    }
  })
}

module.exports = listener;
