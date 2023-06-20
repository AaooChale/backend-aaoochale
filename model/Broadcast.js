const mongoose = require("mongoose");
const path = require("path");
const getISTTime = require(path.join(__dirname, "..", "helpers", "getISTTime"));
const Broadcast = new mongoose.Schema(
  {
    message: {
      type: String,
    },
    status: {
      type: String,
      default: false,
      enum: [true,false],
    },
    createdOn: {
      type: Date,
      default: getISTTime(new Date(Date.now())),
    },
  },
  { toJSON: { virtuals: true } }
);
module.exports = mongoose.model("broadcasts", Broadcast);
