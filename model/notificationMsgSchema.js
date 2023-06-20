const mongoose = require("mongoose");
const path = require("path");
const getISTTime = require(path.join(__dirname, "..", "helpers", "getISTTime"));
const Schema = mongoose.Schema;
const notificationMsgSchema = new Schema(
  {
    type: {
      type: String,
      required: [false, "Please Provide type"],
      trim: true,
    },
    msg: {
      type: String,
      required: [false, "Please Provide msg"],
      trim: true,
    },
    createdOn: {
      type: Date,
      default: getISTTime(new Date(Date.now())),
    },
    deletedOn: {
      type: Date,
      default: null,
    },
  },
  { toJSON: { virtuals: true } }
);

const NotificationMsg = mongoose.model("NotificationMsg", notificationMsgSchema);
module.exports = NotificationMsg;
