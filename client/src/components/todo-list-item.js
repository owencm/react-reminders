import React from 'react';
import ReactDOM from 'react-dom';

import IconButton from 'material-ui/lib/icon-button';
import ListItem from 'material-ui/lib/lists/list-item';

import DoneIcon from 'material-ui/lib/svg-icons/action/done';

import strings from '../strings.js';

let generateTouchTapHandler = (handler, arg) => {
  return () => handler(arg);
}


const TodoListItem = (props) => {
  return (
    <ListItem
      primaryText={props.todo.title}
      secondaryText={strings.todoIntervalAndLastDone(
        props.todo.interval,
        props.todo.lastDone
      )}
      onTouchTap={generateTouchTapHandler(props.onEditClick, props.todo)}
      rightIconButton={
        <IconButton onTouchTap={generateTouchTapHandler(props.onDoneClick, props.todo)}>
          <DoneIcon />
        </IconButton>
      }
    />
  )
}

module.exports = TodoListItem;
