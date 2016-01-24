var log = function (enableLogging) {
  return function () {
    if (enableLogging) {
      console.log.apply(console, arguments);
    }
  }
}

module.exports = log;
