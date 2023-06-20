const path = require("path");
const NotificationMsg = require("../model/notificationMsgSchema");
const getISTTime = require(path.join(__dirname, "..", "helpers", "getISTTime"));
require("dotenv").config();

exports.addMsg = async (req, res, next) => {
  try {
    const { type,msg } = req.body;
    const addNotificationMsg = await NotificationMsg.create({
      type: type,
      msg: msg,
    });

    res.status(200).json({
      status: true,
      message: "Add Notification Message Succussefully",
      addNotificationMsg,
    });
  } catch (error) {
    next(error);
  }
};

exports.msgList = async (req, res, next) => {
  try {
    const msgList = await NotificationMsg.find({deletedOn:null}).sort({createdOn:-1}).select('-deletedOn');
    res.status(200).json({
      status: true,
      msg: "Get all Notification Message successfully",
      msgList,
    });
  } catch (err) {
    next(err);
  }
};

exports.msgUpdate = async (req,res,next) => {
  try {
    const { type,msg,id } = req.body;

    const updateNotificationMsg = await NotificationMsg.findByIdAndUpdate(
      { _id: id },
      { type: type,msg:msg },
      { runValidator: true, useFindAndModify: false, new: true }
    );


    res.status(200).json({
      status: true,
      message: "Update Notification Message Succussefully",
      updateNotificationMsg,
    });
  } catch (error) {
    next(error);
  }
}

exports.msgDelete = async (req,res,next) => {
  try{
    const {id} = req.body;
    const deleteNotificationMsg = await NotificationMsg.findByIdAndUpdate(
      {_id:id},
      {deletedOn:getISTTime(new Date(Date.now()))},
      { runValidator: true, useFindAndModify: false, new: true }
    );
    res.status(200).json({
      status: true,
      message: "Delete Notification Message Succussefully",
      deleteNotificationMsg,
    });
  }catch(error){
    next(error);
  }

}
