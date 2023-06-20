const mongoose = require("mongoose");
const path = require("path");
const getISTTime = require(path.join(__dirname, "..", "helpers", "getISTTime"));
const Schema = mongoose.Schema;
const User = require("../model/userModel");
const Ride = require("../model/rideModel");
const RideAlertSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    startLocation: {
      type: String,
      required: [false, "Please Provide pickUpLocation"],
      trim: true,
    },
    endLocation: {
      type: String,
      required: [false, "Please Provide pickUpLocation"],
      trim: true,
    },
    startLat: {
      type: Number,
      required: [false, "Please Provide pickupLat"],
      trim: true,
    },
    startLong: {
      type: Number,
      required: [false, "Please Provide pickLong"],
      trim: true,
    },
    endLat: {
      type: Number,
      required: [false, "Please Provide dropLat"],
      trim: true,
    },
    endLong: {
      type: Number,
      required: [false, "Please Provide dropLong"],
      trim: true,
    },
    date: {
      type: Date,
      required: [false, "Please Provide date"],
      trim: true,
    },
    peopleCount: {
      type: Number,
      required: [false, "Please Provide peopleCount"],
      trim: true,
    },
    createdOn: {
      type: Date,
      default: getISTTime(new Date(Date.now())),
    },
  },
  { toJSON: { virtuals: true } }
);

const RideAlert = mongoose.model("RideAlert", RideAlertSchema);
module.exports = RideAlert;
