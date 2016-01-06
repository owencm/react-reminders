const now = () => Date.now();

const daysBetween = (dateA, dateB) => {
  return Math.round(
    Math.abs(dateA-dateB)/(1000*60*60*24)
  );
}

const daysSince = (date) => {
  return daysBetween(date, now());
}

module.exports = {
  now, daysBetween, daysSince
}
