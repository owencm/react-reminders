// TODO: Find a nicer way to handle the generation of dueTodos and futureTodos etc

import localforage from 'localforage';
const lf = localforage;
import dates from './dates.js';

let listeners = [];
let ready = false;

const addListener = (listener) => {
  listeners.push(listener);
}

const notifyListenersOfChange = () => {
  let dueTodos = filterDueTodos(todos);
  let futureTodos = filterFutureTodos(todos);
  listeners.map((listener) => notifyListenerOfChange(listener, todos, dueTodos, futureTodos));
}

const notifyListenerOfChange = (listener, todos, dueTodos, futureTodos) => {
  listener(todos, dueTodos, futureTodos);
}

let todos;

const addTodo = (title, interval, lastDone = dates.now()) => {
  todos.push({title, interval, lastDone, id: todos.length});
  notifyListenersOfChange();
}

const removeTodo = (todoId) => {
  todos = todos.filter((todo) => {
    return todo.id !== todoId;
  })
  notifyListenersOfChange();
}

const updateTodo = (todoId, title, interval) => {
  for (let i = 0; i < todos.length; i++) {
    let todo = todos[i];
    if (todo.id === todoId) {
      todo.title = title;
      todo.interval = interval;
      notifyListenersOfChange();
      return;
    }
  }
  throw new Error('Could not find todo to update');
}

const markDone = (todoId) => {
  for (let i = 0; i < todos.length; i++) {
    let todo = todos[i];
    if (todo.id === todoId) {
      todo.lastDone = dates.now();
      notifyListenersOfChange();
      return;
    }
  }
  throw new Error('Could not find todo to mark done');
}

const getDueTodos = () => {
  if (!ready) {
    throw new Error('Tried to access todos before it was loaded');
  }
  return filterDueTodos(todos);
}

const getFutureTodos = () => {
  if (!ready) {
    throw new Error('Tried to access todos before it was loaded');
  }
  return filterFutureTodos(todos);
}

let init = () => {
  console.log('initializing the model');
  todos = [];

  lf.ready()
    // .then(() => lf.setItem('todos', null))
    .then(() => lf.getItem('todos'))
    .then((storedTodos) => {
      if (storedTodos === null) {
        ready = true;
        addTodo('Call Mum', 7, 0);
        addTodo('Deep clean the kitchen', 14);
      } else {
        todos = storedTodos;
        ready = true;
        notifyListenersOfChange();
      }
      // Do this only after we've restored todos to avoid race conditions
      addListener(() => {
        lf.ready().then(() => lf.setItem('todos', todos));
      });
    })
    .catch((e) => { console.error(e) });

  // setInterval(() => {
  //   todos.map((todo) => { todo.lastDone -= 24*60*60*1000 });
  //   notifyListenersOfChange();
  // }, 10000);
};

// Stateless helpers

const filterFutureTodos = (todos) => {
  let futureTodos = [];
  for (let i = 0; i < todos.length; i++) {
    let todo = todos[i];
    if (dates.daysSince(todo.lastDone) < todo.interval) {
      futureTodos.push(todo);
    }
  }
  return futureTodos;
}

const filterDueTodos = (todos) => {
  if (!ready) {
    console.error('Tried to read a todo before they were loaded');
  }
  let dueTodos = [];
  for (let i = 0; i < todos.length; i++) {
    let todo = todos[i];
    if (dates.daysSince(todo.lastDone) >= todo.interval) {
      dueTodos.push(todo);
    }
  }
  return dueTodos;
}

module.exports = {
  init,
  addTodo,
  removeTodo,
  updateTodo,
  markDone,
  addListener,
  getDueTodos,
  getFutureTodos
};
