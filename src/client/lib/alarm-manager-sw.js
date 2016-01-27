import urlEncode from './url-encode.js';
import localforage from 'localforage';
const lf = localforage;

// Parse Metadata
// TODO: Move these somewhere central
const appId = 'ZqfKAmPjdMdNkzJV4ZAGZC2odz2BPjTaIlJRBeOF';
// TODO: this is supposed to be secret so use the JS key instead
const restAPIKey = 'AQzcxaea2zWLoqj9EDVyH7D6Poe4k87Tu9W96mH9';
const JSAPIKey = 'e2VWvnFULHByDWnywBemHM4JhvKHmdrEuuKvtBJw';

let listeners = [];

// Listeners must return a promise when called
const addListener = (callback) => {
  listeners.push(callback);
}

const notifyListeners = (data) => {
  return Promise.all(listeners.map(listener => listener(data)));
}

const getPushData = () => {
  // This is the actual query I want, but can't use because the Parse SDK
  // depends on localstorage and doesn't work in service workers
  //
  // return Parse._getInstallationId().then((installationId) => {
  //   const scheduledPushQuery = new Parse.Query('PushData')
  //     .equalTo('installationId', installationId)
  //     .lessThan('targetDeliveryTime', now).equalTo('displayed', false)
  //     .ascending('targetDeliveryTime').first();
  //   return scheduledPushQuery;
  // })
  //

  return lf.getItem('installationId').then((installationId) => {
    const className = 'PushData';
    const urlEncodedQuery = urlEncode({
      where: {
        'installationId': installationId
      }
    });
    const request = new Request(`https://api.parse.com/1/classes/${className}?${urlEncodedQuery}`, {
      method: 'GET',
      headers: {
        'X-Parse-Application-Id': appId,
        'X-Parse-REST-API-Key': restAPIKey,
        'Content-Type': 'application/json'
      }
    });
    // TODO: Error handling
    return fetch(request)
                  .then(response => response.json())
                  .then(data => {
                    console.log(data);
                    // Note we limit to 1 in the query so it's safe to fetch only
                    // the 0th entry
                    return data.results[0].data;
                  });
    // TODO: Mark notifications as received
    // .then((pushData) => {
    //   pushData.set('received', true);
    //   pushData.save();
    //   return pushData.data;
    // });
  })
}

self.addEventListener('push', event => {
  event.waitUntil(getPushData().then((data) => {
    return notifyListeners(data);
  }));
});

module.exports = { addListener };
