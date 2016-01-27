Parse.Cloud.job('cronNotificationScheduler', (req, status) => {
  // Todo: remove duplicates

  const now = new Date();
  const scheduledPushesQuery = new Parse.Query('PushData')
    // .lessThan('targetDeliveryTime', now)
    // .equalTo('delivered', false);

  scheduledPushesQuery.each((pushData) => {
    console.log("Planning on sending a push to installationId:");
    console.log(pushData.get('installationId'));
    const installationQuery = new Parse.Query(Parse.Installation)
      .equalTo('installationId', pushData.get('installationId'));
    Parse.Push.send({
      where: installationQuery,
      data: {}
    },{
      success: () => {
        pushData.set('delivered', true);
        pushData.save();
        console.log('sent a notification');
      },
      error: (error) => {
        console.error(error);
      }
    });
  });
});
