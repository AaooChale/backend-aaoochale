var axios = require("axios");
function sendNotification(token, notification,imageUrl=null) {
  delete notification.image;
  delete notification.click_action;
  // setting up data to sent
  notifications = {...notification,color:"#205CBE"}
  var data = JSON.stringify({
    to: token,
    imageUrl: imageUrl,
    notification: notification,
  });

  //api configuration
  var config = {
    method: "post",
    url: "https://fcm.googleapis.com/fcm/send",
    headers: {
      Authorization: "key=" + process.env.FIREBASE_SERVER_KEY,
      "Content-Type": "application/json",
    },
    data: data,
  };


  axios(config);
}

module.exports = { sendNotification };
