const path = require("path");
const catchAsync = require("../utils/catchAsync");
const AppErr = require("../utils/AppErr");
const Notification = require("../model/notificationSchema");
const getISTTime = require("../helpers/getISTTime");
const Rating = require("../model/ratingModel");
const { web, mobile } = require("../helpers/notificationRe");

// firebase
const Token = require("../model/fireBaseSchema");
const firebase = require("../notification/firebase");
// firebase

// // HELPER FUNCTION
const getUser = (username) => {
  const onlineUsers = global.onlineUsers;
  return onlineUsers.find((user) => {
    return user.username == username.toString();
  });
};

module.exports.postNotification = async (sender, receiver, type, message,notificationType) => {
  if (global?.onlineUsers?.length) {
    const io = global.io;
    const receive = getUser(receiver);
    if (receive) {
      io.to(receive.socketId).emit("getNotification", {
        sender: sender,
        receiver: receiver,
        type: type,
        message: message,
        createdOn: getISTTime(new Date(Date.now())),
        notificationType:notificationType
      });
    }
  }
  const notification = await Notification.create({
    sender: sender,
    receiver: receiver,
    type: type,
    message: message,
    notificationType:notificationType
  });
};

/// self
module.exports.postNotificationSelf = async (sender, type, message,notificationType) => {
  if (global?.onlineUsers?.length) {
    const io = global.io;
    const receive = getUser(sender);
    if (receive) {
      io.to(receive.socketId).emit("getNotification", {
        sender: sender,
        type: type,
        message: message,
        createdOn: getISTTime(new Date(Date.now())),
        notificationType:notificationType
      });
    }
  }
  const notification = await Notification.create({
    sender: sender,
    type: type,
    message: message,
    notificationType:notificationType
  });
};
exports.getAllNotifications = async (req, res, next) => {
  const { id } = req.body;
  const getAllNotifications = await Notification.find({ receiver: id,status:"false" }).sort({ createdOn: -1 }).populate({
    path: "sender",
    select: "firstName lastName profilePicture",
    model: "User",
  });
  res.status(200).json({
    status: true,
    lengt: getAllNotifications.length,
    data: getAllNotifications,
  });
};
exports.getNotificationById = catchAsync(async (req, res, next) => {
  const { id } = req.body;
  const notificationById = await Notification.findById({ _id: id });
  res.status(200).json({
    status: true,
    data: notificationById,
  });
});

/// get notification by self

exports.getAllNotificationsBySelf = async (req, res, next) => {
  const { id } = req.body;

  const getAllNotifications = await Notification.find({ $and: [{ sender: id }, { type: "Self" },{status:"false"}] })
    .sort({ createdOn: -1 })
    .populate({
      path: "sender",
      select: "firstName lastName profilePicture",
      model: "User",
    });
  // same notification skip
  const unique = [...new Set(getAllNotifications.map((item) => item.message))];
  const uniqueData = unique.map((id) => {
    return getAllNotifications.find((s) => s.message === id);
  });

  res.status(200).json({
    status: true,
    data: uniqueData,
  });
};

exports.getNotificationById = catchAsync(async (req, res, next) => {
  const { id } = req.body;
  const notificationById = await Notification.findById({ _id: id });
  res.status(200).json({
    status: true,
    data: notificationById,
  });
});

exports.deleteNotifications = catchAsync(async (req, res, next) => {
  const { notificationId } = req.body;
  const deleteNotification = await Notification.findByIdAndDelete({ _id: notificationId });
  res.status(200).json({
    status: true,
    data: deleteNotification,
  });
});


module.exports.sendnotification = async (req, res, next) => {
  const data_object = {
    sender: req.body.sender,
    receiver: req.body.receiver,
    type: "Rating",
    message: req.body.message,
  };
  const notification = new Notification(data_object);
  const err = notification.joiValidate(req.body);

  if (err.error) {
    var final = {
      res: "error",
      msg: err.error.details[0].message,
    };

    res.status(400).send(final);
  } else {
    notification.save(function (err, result) {
      if (result) {
        var response = "";
        Token.find({}, async function (err, tokens) {
          var count = 0;
          if (tokens) {
            for (each of tokens) {
              var data = {
                body: req.body.message,
                title: req.body.sender,
              };
              response = await firebase.sendNotification(each.token, data);
              count++;
            }
          }
          var final = {
            res: "success",
            msg: count + " Notification sent successfully.",
            data: result,
          };
          res.status(200).send(final);
        });
      } else {
        var final = {
          res: "error",
          msg: "Something went wrong!",
        };
        res.status(400).send(final);
      }
    });
  }
};

exports.updateStatus = async (req,res,next) => {
  try{
    const {id} = req.body;
    await Notification.updateMany({ sender: id, type:'Self' },{ $set: { status: 'true' } });
    await Notification.updateMany({ receiver: id, type:{$ne:'Self'} },{ $set: { status: 'true' } });
    res.status(200).json({
      status: true,
      data: {
        message: "Status Updated Successfully!!",
      },
    });
  } catch (error) {
    next(error);
  }
}

exports.getNotificationTypes = async (req,res,next) =>{
  try{
    const notificationTypes = await Notification.distinct( "notificationType" );
    if(notificationTypes.length > 0){
      res.status(200).json({
        status:true,
        message:"Notification Types get Successfully!!",
        data:notificationTypes
      });
    }
    res.status(200).json({
      status:false,
      message:"No Data Found!!",
      data:notificationTypes
    });
  } catch (error) {
    next(error);
  }
}

