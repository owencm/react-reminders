import React from 'react';
import ReactDOM from 'react-dom';

import List from 'material-ui/lib/lists/list';

import TodoListItem from './todo-list-item.js';

const TodoList = (props) => {
  // If there are no todos, don't render the section
  if (props.todos.length == 0) {
    // Can't return null from a stateless component, so return a noscript tag
    return <noscript />;
  }
  let todoListItems = props.todos.map((todo) => {
    return <TodoListItem todo={todo} onDoneClick={props.onDoneClick} />
  });
  return (
    <List subheader={props.subheader}>
      {todoListItems}
    </List>
  );
}

module.exports = TodoList;
