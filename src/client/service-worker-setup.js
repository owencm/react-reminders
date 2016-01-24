const init = () => {

  // Check that service workers are supported
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./service-worker.js', {
      scope: './'
    });
  }

}

module.exports = init;
