import localforage from 'localforage';
const lf = localforage;

const subscribeWithParse = (deviceToken) => {
  let installation = new Parse.Installation;

  // For some reason we need to manually add this to the installation before
  // saving
  Parse._getInstallationId().then((installationId) => {
    lf.ready().then(() => lf.setItem('installationId', installationId));
    installation.set({
      deviceToken: deviceToken,
      pushType: 'gcm',
      deviceType: 'android',
      GCMSenderId: '70689946818',
      installationId: installationId
    });
    return installation.save();
  });
}



let deviceToken = 'fa0XzIcMlSY:APA91bE1I8jmeVtqNzA3aRGQVtcUCJckSosfHO_EIzivEEd5Mo0CAK_s9HuqpmbtTsefowSTE05vd3s5hxXrd9pE6Vzgu3kAudndhz-bRJkbl2tugbmbjOuIg5Hw7j4chmPdsPPACIqj';
