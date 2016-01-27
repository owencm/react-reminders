import alarmManager from './lib/alarm-manager.js';
// Localhost key for sender ID: 653317226796
// alarmManager.init('AIzaSyBBh4ddPa96rQQNxqiq_qQj7sq1JdsNQUQ');
// Production key for sender ID: 70689946818
alarmManager.init('AIzaSyDNlm9R_w_0FDGjSM1fzyx5I5JnJBXACqU');

// When something changes in the model, make sure the alarms are updated
model.addListener((todos, dueTodos, futureTodos, removedTodos) => {
  for (let i = 0; i < removedTodos.length; i++) {
    let todo = removedTodos[i];
    let tag = todo.id;
    alarmManager.unset(tag);
  }
  for (let i = 0; i < todos.length; i++) {
    let todo = todos[i];
    let interval = todo.interval * 24*60*60*1000;
    let targetTime = todo.lastDone + interval;
    let tag = todo.id;
    let notificationTitle = 'Aspire: ' + todo.title;
    let notificationBody = strings.todoIntervalAndLastDone(
                                                            todo.interval,
                                                            todo.lastDone
                                                          );
    alarmManager.set(tag, targetTime, interval, {
      title: notificationTitle,
      body: notificationBody
    });
  }
});
