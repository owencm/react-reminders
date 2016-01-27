let log = (...msgs) => {
  console.log(msgs.map(JSON.stringify).join(' '));
}

Parse.Cloud.define('scheduleNotification', (req, resp) => {
  // let { startTime, data } = req.params;
  // log(req.body);
  // log('Scheduling a notification in response to ', req.body, 'to be shown at', startTime, 'and include', data);
  // TODO: write data somewhere
  // TODO: Schedule a notification

  let thisUserQuery = new Parse.Query(Parse.Installation);
  Parse.Push.send({
    where: thisUserQuery,
    data: {
      alert: "New Ticket Added",
      sound: "default"
    }
  },{
    success: () => {
      response.success('true');
    },
    error: (error) => {
      response.error(error);
    }
  });
});

Parse.Cloud.define('setDeviceToken', (req, resp) => {
  let { deviceToken, userId } = req.params;
  Parse.Cloud.useMasterKey('tc5jozG8ZZZPbR1wFFNKDrAqnYejEqjMEIFVx2Ik');
  let user = new Parse.User();
  user.id = userId;
  let query = new Parse.Query(Parse.Installation);
    query.equalTo('user', user); // Match Installations with a pointer to this User
    query.find({
      success: (installations) => {
        for (let i = 0; i < installations.length; ++i) {
          // Add the channel to all the installations for this user
          installations[i].set('deviceToken', deviceToken)
        }

        // Save all the installations
        Parse.Object.saveAll(installations, {
          success: (installations) => {
            // All the installations were saved.
            response.success("All the installations were updated with new deviceTokens.");
          },
          error: (error) => {
            // An error occurred while saving one of the objects.
            console.error(error);
            response.error("An error occurred while updating this user's installations.")
          },
        });
      },
      error: (error) => {
        console.error(error);
        response.error("An error occurred while looking up this user's installations.")
      }
    });
});

Parse.Cloud.job('cronNotificationScheduler', (req, status) => {
  status.success('Job says Hello World!');
});
