const path = require("path");
const catchAsync = require(path.join(__dirname, "..", "utils", "catchAsync"));
const AppErr = require(path.join(__dirname, "..", "utils", "AppErr"));
const User = require("../model/userModel");
const Rating = require("../model/ratingModel");
const notificationController = require("../notification/notificationController");
const Token = require("../model/fireBaseSchema");
const firebase = require("../notification/firebase");
require("dotenv").config();

const GetToken = async (userId) => {
  const list = await Token.find({ user_id: userId });

  if (list.length > 0) {
    return list[0].token;
  } else {
    var token = "";
    return token;
  }
};
exports.createRating = async (req, res, next) => {
  try {
    const user = await User.findOne({ _id: req && req.body && req.body.userId });
    const { userId, driverId, rideId, message, startRating } = req.body;
    const createRating = await Rating.create({
      userId: userId,
      driverId: driverId,
      rideId: rideId,
      message: message,
      startRating: startRating,
    });
    var msg = `${user.firstName} ${user.lastName} give you a ${startRating} star rating.`
    await notificationController.postNotification(userId, driverId, "Rating",msg,"Rating");
    if (driverId) {
      var content = {
        title: 'Rating',
        body: msg,
        image:"https://media.istockphoto.com/id/1396758801/photo/5-star-rating.jpg?b=1&s=170667a&w=0&k=20&c=KN7SJOGefFe-2GJqzqN5ULtnurbao3wYnm2Ls14uXKM="
      };
      const key = await GetToken(driverId);
      if (key != "") {
        var firebaseres = await firebase.sendNotification(key, content);
      }
      res.status(200).json({
        status: true,
        message: "Create Rating Succussefully",
        createRating,
      });
    }
  } catch (error) {
    next(error);
  }
};



exports.getRating = catchAsync(async (req, res, next) => {
  const { rideId } = req.body;
  if (!rideId) return next(new AppErr("Pelase Provide rideId"), 200);
  const getRating = await Rating.find({ rideId: rideId });
  const sum = [];
  const data = getRating.map((item) => {
    sum.push(item.startRating);
  });
  let count = 0;
  let total = 0;

  while (count < sum.length) {
    total = total + sum[count];
    count += 1;
  }
  
  var  rating = 0;
  if(sum.length > 1){
    const ratingAverage = parseFloat(total / sum.length);
    rating = ratingAverage.toFixed(1);
  }
  res.status(200).json({
    status: true,
    message: "Get Rating Successfully By rideId",
    ratingAverage: rating,
  });
});

exports.getAverageRatingByUserId = catchAsync(async (req, res, next) => {
  const { userId } = req.body;
  if (!userId) return next(new AppErr("Pelase Provide userId"), 200);
  const getRating = await Rating.find({ driverId: userId });

  const sum = [];
  const rate = "";
  const data = getRating.map((item) => {
    sum.push(item.startRating);
  });
  let count = 0;
  let total = 0;

  while (count < sum.length) {
    total = total + sum[count];
    count += 1;
  }
  const ratingAverage = parseFloat(total / sum.length);
  const rating = ratingAverage.toFixed(1);
  if (!(rating == "NaN")) {
    res.status(200).json({
      status: true,
      message: "Get Rating Successfully By userId",
      ratingAverage: rating,
    });
  } else {
    res.status(200).json({
      status: true,
      message: "No any Rating",
      ratingAverage: rate,
    });
  }
});


exports.giveOwnRatingOfUser = catchAsync(async (req, res, next) => {
  const { userId } = req.body;
  if (!userId) return next(new AppErr("Pelase Provide userId"), 200);
  const givenRating = await Rating.find({ userId: userId }).sort({createdOn:-1})
    .populate({
      path: "driverId",
      select: "-email -mobile -createdOn -bio -DOB -ride -__v",
      model: "User",
    })
    .populate({
      path: "rideId",
      select: "-_id -__v",
      model: "Ride",
    });

  res.status(200).json({
    status: true,
    message: "Get Rating Successfully By userId",
    length: givenRating.length,
    givenRating,
  });
});


exports.getRatingOtherUserSend = catchAsync(async (req, res, next) => {
  const { driverId } = req.body;
  if (!driverId) return next(new AppErr("Pelase Provide driverId"), 200);
  const riverGetRating = await Rating.find({ driverId: driverId }).sort({createdOn:-1})
    .populate({
      path: "userId",
      select: "-email -mobile -createdOn -bio -DOB -ride -__v",
      model: "User",
    })
    .populate({
      path: "rideId",
      select: "-_id -__v",
      model: "Ride",
    });

  res.status(200).json({
    status: true,
    message: "Get send Rating Successfully",
    length: riverGetRating.length,
    riverGetRating,
  });
});

// reply driver update
exports.replyDriver = catchAsync(async (req, res, next) => {
  const { id, sender, receiver, reply } = req.body;
  if (!id || !reply || !sender || !receiver)
    return next(new AppErr("Pelase Provide id, reply, receiver and receiver"), 200);
  const checkReply = await Rating.findOne({_id:id});
  if(checkReply?.reply != null){
    res.status(200).json({
      status: false,
      message:"Already Replied to this Rating",
      data: {},
    });
  }
  const replyDriver = await Rating.findByIdAndUpdate(
    { _id: id },
    { reply: reply },
    { runValidator: true, useFindAndModify: false, new: true }
  );

  await replyDriver.save();
  await notificationController.postNotification(
    sender,
    receiver,
    "Reply",
    reply,
    "RatingReply"
  );
  if (receiver) {
    var content = {
      title: "Rating Reply",
      body: reply,
      image:"http://res.cloudinary.com/dyetuvbqa/image/upload/v1672929153/r3pwo0x7wmrhjrfyuruz.jpg"
    };
    const key = await GetToken(receiver);

    if (key != "") {
      var firebaseres = await firebase.sendNotification(key, content);
    }
  }
  res.status(200).json({
    status: true,
    data: {
      message: "Driver reply Successfully",
      replyDriver,
    },
  });
});

// get retails of rating id
exports.getRatingDetailsById = catchAsync(async (req, res, next) => {
  const { id } = req.body;
  if (!id) return next(new AppErr("Pelase Provide id"), 200);
  const getRatingDetails = await Rating.findOne({ _id: id });
  var getRatingDetail = {
                          ...getRatingDetails._doc,
                          replyStatus:(getRatingDetails.reply == null ) ? true : false
                        };
  res.status(200).json({
    status: true,
    message: "Get Rating getRatingDetails Successfully",
    getRatingDetails:getRatingDetail,
  });
});
