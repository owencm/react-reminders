// TODO: Find a nicer way to handle the generation of dueTodos and futureTodos etc

import dates from './dates.js';

let listeners = [];

const addListener = (listener) => {
  listeners.push(listener);
  let dueTodos = getDueTodos(todos);
  let futureTodos = getFutureTodos(todos);
  notifyListenerOfChange(listener, dueTodos, futureTodos);
}

const notifyListenersOfChange = () => {
  let dueTodos = getDueTodos(todos);
  let futureTodos = getFutureTodos(todos);
  listeners.map((listener) => notifyListenerOfChange(listener, dueTodos, futureTodos));
}

const notifyListenerOfChange = (listener, dueTodos, futureTodos) => {
  listener(dueTodos, futureTodos);
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

const getDueTodos = (todos) => {
  let dueTodos = [];
  for (let i = 0; i < todos.length; i++) {
    let todo = todos[i];
    if (dates.daysSince(todo.lastDone) >= todo.frequency) {
      dueTodos.push(todo);
    }
  }
  return dueTodos;
}

const getFutureTodos = (todos) => {
  let futureTodos = [];
  for (let i = 0; i < todos.length; i++) {
    let todo = todos[i];
    if (dates.daysSince(todo.lastDone) < todo.frequency) {
      futureTodos.push(todo);
    }
  }
  return futureTodos;
}

let init = () => {
  todos = (!!localStorage.todos) ? JSON.parse(localStorage.todos) : [];
  if (todos.length === 0) {
    addTodo('Call Mum', 7, 0);
    addTodo('Deep clean the kitchen', 14);
  }

  addListener(() => {
    localStorage.todos = JSON.stringify(todos);
  });

  setInterval(() => {
    todos.map((todo) => { todo.lastDone -= 24*60*60*1000 });
    notifyListenersOfChange();
  }, 10000);
};

init();

module.exports = {
  addTodo,
  markDone,
  addListener
};
