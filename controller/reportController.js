const path = require("path");
const catchAsync = require(path.join(__dirname, "..", "utils", "catchAsync"));
const AppErr = require(path.join(__dirname, "..", "utils", "AppErr"));
const Report = require("../model/reportModel");
const notificationController = require("../notification/notificationController");

require("dotenv").config();


const Token = require("../model/fireBaseSchema");
const firebase = require("../notification/firebase");


const GetToken = async (userId) => {
  const list = await Token.find({ user_id: userId });

  if (list.length > 0) {
    return list[0].token;
  } else {
    var token = "";
    return token;
  }
};

exports.createReport = async (req, res, next) => {
  try {
    const { userId, reportUId,rideId, preDefindMessage, userMessage } = req.body;
    const report = await Report.create({
      userId: userId,
      reportUId: reportUId,
      rideId: rideId,
      preDefindMessage: preDefindMessage,
      userMessage: userMessage,
    });
    await notificationController.postNotification(userId, reportUId, "Report", userMessage,"Report");

    if (reportUId) {
      var content = {
        title: "Report",
        body: userMessage,
        image: "https://cdn-icons-png.flaticon.com/512/38/38808.png",
      };
      const key = await GetToken(reportUId);

      if (key != "") {
        var firebaseres = await firebase.sendNotification(key, content);
      }
    }
    res.status(200).json({
      status: true,
      message: " Create Report Succussefully",
      report,
    });
  } catch (error) {
    next(error);
  }
};

// get report
exports.getReport = catchAsync(async (req, res, next) => {
  const { userId } = req.body;
  if (!userId) return next(new AppErr("Pelase Provide userId"), 200);

  const rideBookedRide = await Report.find({ userId: userId }).sort({createdOn:-1});
  res.status(200).json({
    status: true,
    message: "Get report Successfully By uerId",
    rideBookedRide,
  });
});

