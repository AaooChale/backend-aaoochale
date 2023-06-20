const mongoose = require("mongoose");
const path = require("path");
const getISTTime = require(path.join(__dirname, "..", "helpers", "getISTTime"));
const Schema = mongoose.Schema;
const User = require("../model/userModel");
const Ride = require("../model/rideModel");
const RideViewSchema = new Schema(
  {
    rideId: {
      type: mongoose.Schema.ObjectId,
      ref: "Ride",
    },
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    createdOn: {
      type: Date,
      default: getISTTime(new Date(Date.now())),
    },
  },
  { toJSON: { virtuals: true } }
);

const RideView = mongoose.model("RideView", RideViewSchema);
module.exports = RideView;
