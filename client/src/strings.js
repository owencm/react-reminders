import dates from './dates.js';

const desiredFrequency = (days) => {
  switch (days) {
    case 1:
      return 'Every day';
    case 7:
      return 'Every week';
    case 14:
      return 'Every two weeks';
    case 30:
      return 'Every month';
    default:
      throw new Error('Invalid frequency specified for todo');
  }
}

const lastDone = (days) => {
  if (days < 1) {
    return 'just now';
  } else if (days < 2) {
    return 'yesterday';
  } else if (days < 7) {
    return 'this week';
  } else if (days < 14) {
    return 'one week ago';
  } else if (days < 30) {
    return 'this month';
  } else if (days < 60) {
    return 'one month ago';
  } else {
    return 'a long time ago';
  }
}

const todoFrequencyAndLastDone = (todoFrequency, todoLastDone) => {
  let daysSinceLastDone = dates.daysSince(todoLastDone);
  return `${desiredFrequency(todoFrequency)}, last done ${lastDone(daysSinceLastDone)}`;
}

module.exports = {
  todoFrequencyAndLastDone
};
