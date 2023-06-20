const mongoose = require("mongoose");
const path = require("path");
const getISTTime = require(path.join(__dirname, "..", "helpers", "getISTTime"));
const User = require("../model/userModel");
const Schema = mongoose.Schema;
const reportSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    reportUId: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    rideId: {
      type: mongoose.Schema.ObjectId,
      ref: "Ride",
    },
    preDefindMessage: {
      type: String,
      required: [false, "Please Provide preDefindMessage"],
      trim: true,
    },
    userMessage: {
      type: String,
      required: [false, "Please Provide userMessage"],
      trim: true,
    },
    createdOn: {
      type: Date,
      default: getISTTime(new Date(Date.now())),
    },
  },
  { toJSON: { virtuals: true } }
);

const Report = mongoose.model("Report", reportSchema);
module.exports = Report;
