const path = require("path");
const AppErr = require(path.join(__dirname, "..", "utils", "AppErr"));
const User = require("../model/userModel");
const Ride = require("../model/rideModel");
const Helper = require("../config/Helper");
const Chat = require("../model/chatModel");
const notificationController = require("../notification/notificationController");
const Token = require("../model/fireBaseSchema");
const firebase = require("../notification/firebase");
const Notification = require("../model/notificationSchema");
const getISTTime = require(path.join(__dirname, "..", "helpers", "getISTTime"));
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

// // HELPER FUNCTION
const getUser = (username) => {
  const onlineUsers = global.onlineUsers;
  return onlineUsers.find((user) => {
    return user.username == username.toString();
  });
};


// create chat
exports.createChat = async (req, res, next) => {
  try {
    const user = await User.findOne({ _id: req && req.body && req.body.senderId }); 
    const { senderId, receiverId, rideId, status, message } = req.body;

    if (global?.onlineUsers?.length) {
      const io = global.io;
      // const receive = receiver;
      const receive = getUser(receiverId);
      console.log("receive receive receive receives", receive);
      if (receive) {
        io.to(receive.socketId).emit("msg-recieve", {
          message: message,
          senderId: senderId,
          receiverId: receiverId,
          rideId: rideId,
          status: status,
          createdOn: getISTTime(new Date(Date.now())),
        });
      }
    }
    const data = await Chat.create({
      message: message,
      senderId: senderId,
      receiverId: receiverId,
      rideId: rideId,
      status: status,
      createdOn: new Date(Date.now()),
    });
    const ids = [senderId,receiverId];
    const checkData = await Notification.findOne({ senderId: {$in:ids} , reciverID: {$in:ids}, type:'Chat'}).sort({"createdOn": -1});
    var checkDate = (checkData!= null) ? new Date(checkData.createdOn) : new Date();
    checkDate.setHours(checkDate.getHours() - 4);
    checkDate.setMinutes(checkDate.getMinutes() - 30);
    var ride = await Ride.findOne({_id:rideId});
    if((new Date() >= new Date(checkDate)) || checkData == null){
      var notificationType = 'Chat';
      var message1 = `You have received a new message from ${user.firstName} ${user.lastName} for your ${ride.startLocation} to ${ride.endLocation} on ${Helper.dateFormatting(ride.tripDate)} ${Helper.timeFormatting(ride.tripTime)}. Click here to reply.`;
      await notificationController.postNotification(
        senderId,
        receiverId,
        "Chat",
        message1,
        notificationType
      );
      if (receiverId) {
        var content = {
          title: "Chat",
          body: message1,
        };
        const key = await GetToken(receiverId);
        if (key != "") {
          var firebaseres = await firebase.sendNotification(key, content);
        }
      }  
    }
    
    res.status(200).json({
      status: true,
      data:data,
    });
  } catch (ex) {
    next(ex);
  }
};

// get chate
exports.getAllChat = async (req, res, next) => {
  try {
    const { senderId, receiverId, rideId } = req.body;

    const messages = await Chat.find({
      $and: [{ senderId: senderId }, { receiverId: receiverId }, { rideId: rideId }],
    })
      .populate({
        path: "senderId",
        select: "firstName lastName",
        model: "User",
      })
      .populate({
        path: "receiverId",
        select: "firstName lastName",
        model: "User",
      });
    res.status(200).json({
      status: true,
      messages,
    });
  } catch (ex) {
    next(ex);
  }
};

exports.getAllChatBySenderId = async (req, res, next) => {
  const { id } = req.body;
  if (!id) return next(new AppErr("Pelase Provide Sender Id"), 200);
  try {
    const getAllChat = await Chat.find({ senderId: id }).populate({
      path: "receiverId",
      select: "firstName lastName profilePicture userStatus",
      model: "User",
    });
    res.status(200).json({
      status: true,
      message: "Get All Chat By Sender Id Succussefully",
      getAllChat,
    });
  } catch (error) {
    next(error);
  }
};

// get all chat by receiverId
exports.getAllChatByReceiverId = async (req, res, next) => {
  const { id } = req.body;
  if (!id) return next(new AppErr("Pelase Provide Receiver Id"), 200);
  try {
    const getAllChat = await Chat.find({ receiverId: id }).populate({
      path: "senderId",
      select: "firstName lastName profilePicture",
      model: "User",
    });
    res.status(200).json({
      status: true,
      message: "Get All Chat By Receiver Id Succussefully",
      getAllChat,
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllChatBySenderIdAndReceiverId = async (req, res, next) => {
  const { senderId, receiverId } = req.body;
  if (!senderId) return next(new AppErr("Pelase Provide Sender Id"), 200);
  if (!receiverId) return next(new AppErr("Pelase Provide Receiver Id"), 200);
  try {
    const getAllChat = await Chat.find({
      $or: [
        { senderId: senderId, receiverId: receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    })
      .sort({ createdOn: 1 })
      .populate({ path: "receiverId", select: "firstName lastName profilePicture _id", model: "User" }) // senderId
      .populate({ path: "senderId", select: "firstName lastName profilePicture _id", model: "User" }); // receiverId

    res.status(200).json({
      status: true,
      message: "Get All Chat By Sender Id And Receiver Id Succussefully",
      getAllChat,
    });
  } catch (error) {
    next(error);
  }
};

exports.getUserChatHistory = async (req, res, next) => {
  const { id } = req.body;
  if (!id) return next(new AppErr("Pelase Login"), 200);
  try {
    const getAllChat = await Chat.find({
      $or: [{ senderId: id }, { receiverId: id }],
    })
      .sort({ createdOn: -1 })
      .populate({ path: "senderId", select: "firstName lastName profilePicture _id userStatus", model: "User" }) // senderId
      .populate({ path: "receiverId", select: "firstName lastName profilePicture _id userStatus", model: "User" }); // receiverId
    let userChatHistory = [];
    getAllChat.forEach((chat) => {
      if (chat.senderId._id == id) {
        if (!userChatHistory.some((user) => user._id == chat.receiverId._id)) {
          let value = {
            rideId: chat.rideId,
            _id: chat.receiverId._id,
            firstName: chat.receiverId.firstName,
            lastName: chat.receiverId.lastName,
            message: chat.message,
            profilePicture: chat.receiverId.profilePicture,
            userStatus: chat.receiverId.userStatus,
          };
          userChatHistory.push(value);
        }
      } else {
        if (!userChatHistory.some((user) => user._id == chat.senderId._id)) {
          let value = {
            rideId: chat.rideId,
            _id: chat.senderId._id,
            firstName: chat.senderId.firstName,
            lastName: chat.senderId.lastName,
            message: chat.message,
            profilePicture: chat.senderId.profilePicture,
          };
          userChatHistory.push(value);
        }
      }
    });
    let uniqueUsers = userChatHistory.filter(
      (user, index, self) => index === self.findIndex((t) => t._id.toString() === user._id.toString())
    );
    res.status(200).json({
      status: true,
      uniqueUsers,
    });
  } catch (error) {
    next(error);
  }
};
