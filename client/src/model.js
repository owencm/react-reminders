// TODO: Find a nicer way to handle the generation of dueTodos and futureTodos etc

import localforage from 'localforage';
const lf = localforage;
import dates from './dates.js';

let listeners = [];
let ready = false;

const addListener = (listener) => {
  listeners.push(listener);
  let dueTodos = filterDueTodos(todos);
  let futureTodos = filterFutureTodos(todos);
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

const addTodo = (title, frequency, lastDone = dates.now()) => {
  todos.push({title, frequency, lastDone, id: todos.length});
  notifyListenersOfChange();
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
    .then(() => lf.getItem('todos'))
    .then((storedTodos) => {
      if (todos === undefined) {
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

  setInterval(() => {
    todos.map((todo) => { todo.lastDone -= 24*60*60*1000 });
    notifyListenersOfChange();
  }, 10000);
};

// Stateless helpers

const filterFutureTodos = (todos) => {
  let futureTodos = [];
  for (let i = 0; i < todos.length; i++) {
    let todo = todos[i];
    if (dates.daysSince(todo.lastDone) < todo.frequency) {
      futureTodos.push(todo);
    }
  }
  return futureTodos;
}

const filterDueTodos = (todos) => {
  if (!ready) {
    console.error('tried to read a todo before they were loaded');
  }
  let dueTodos = [];
  for (let i = 0; i < todos.length; i++) {
    let todo = todos[i];
    if (dates.daysSince(todo.lastDone) >= todo.frequency) {
      dueTodos.push(todo);
    }
  }
  return dueTodos;
}

module.exports = {
  init,
  addTodo,
  markDone,
  addListener,
  getDueTodos,
  getFutureTodos
};
