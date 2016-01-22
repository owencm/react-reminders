// TODO: resubscribe every time the page is loaded if we still have permission

import React from 'react';
import ReactDOM from 'react-dom';

import AppBar from 'material-ui/lib/app-bar';
import Divider from 'material-ui/lib/divider';
import FontIcon from 'material-ui/lib/font-icon';
import FloatingActionButton from 'material-ui/lib/floating-action-button';
import IconButton from 'material-ui/lib/icon-button';
import List from 'material-ui/lib/lists/list';
import ListItem from 'material-ui/lib/lists/list-item';

import TodoList from './components/todo-list.js';

import AddIcon from 'material-ui/lib/svg-icons/content/add';

// Temporary hack to enable material-ui until React 1.0 is released
import injectTapEventPlugin from 'react-tap-event-plugin';
injectTapEventPlugin();

import serviceWorkerSetup from './service-worker-setup.js';
serviceWorkerSetup();

import model from './model.js';
model.init();
import alarmManager from './lib/alarm-manager.js';
alarmManager.init('AIzaSyBBh4ddPa96rQQNxqiq_qQj7sq1JdsNQUQ');
model.addListener((todos, dueTodos, futureTodos) => {
  for (let i = 0; i < todos.length; i++) {
    let todo = todos[i];
    let interval = todo.interval * 24*60*60*1000;
    let targetTime = todo.lastDone + interval;
    let tag = todo.id;
    let notificationTitle = todo.title;
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
import strings from './strings.js';
import { getDeviceId } from './lib/device-id.js';

let handleDoneClicked = (todo) => {
  model.markDone(todo.id);
}

let handleCreateClicked = () => {
  // For some reason this needs a timeout otherwise the click fires twice.
  // Blame react's event system.
  setTimeout(() => {
    let title = prompt('What do you aspire to do more often?');
    if (title === '' || title === undefined || title === null) {
      return;
    }
    let interval = parseInt(prompt('How many days would you like to wait between doing it?'));
    if (isNaN(interval) || interval === undefined || interval === null) {
      return;
    }
    model.addTodo(title, interval);
    // TODO: dim the screen at this point
    alarmManager.subscribeDevice().then(() => {
      console.log('Subscribed for notifications successfully!');
    });
  }, 0);
}

let App = (props) => {
  return (
    <div>
      <AppBar
        title='Aspire'
        showMenuIconButton={false}
      />
      <TodoList
        subheader="It's time to..."
        todos={props.dueTodos}
        onDoneClick={handleDoneClicked}
      />
      <TodoList
        subheader="Later"
        todos={props.futureTodos}
        onDoneClick={handleDoneClicked}
      />
      <div style={{position: 'fixed', bottom: '16px', right: '16px'}}>
        <FloatingActionButton onTouchTap={handleCreateClicked}>
          <AddIcon />
        </FloatingActionButton>
      </div>
    </div>
  );
};

let render = (todos, dueTodos, futureTodos) => {
  ReactDOM.render(
    <App dueTodos={dueTodos} futureTodos={futureTodos}/>,
    document.getElementById('content')
  );
}

// Note this will call the listener when it is added
model.addListener(render);
