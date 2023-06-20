const mongoose = require("mongoose");
const path = require("path");
const getISTTime = require(path.join(__dirname, "..", "helpers", "getISTTime"));
const User = require("../model/userModel");
const Ride = require("../model/rideModel");
const Schema = mongoose.Schema;
const ratingSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    driverId: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    rideId: {
      type: mongoose.Schema.ObjectId,
      ref: "Ride",
    },
    message: {
      type: String,
      required: [false, "Please Provide preDefindMessage"],
      trim: true,
    },
    reply: {
      type: String,
      required: [false, "Please Provide reply"],
      trim: true,
    },
    startRating: {
      type: Number,
      required: [false, "Please Provide rating"],
      enum: [1, 2, 3, 4, 5],
      trim: true,
    },
    createdOn: {
      type: Date,
      default: getISTTime(new Date(Date.now())),
    },
  },
  { toJSON: { virtuals: true } }
);

const Rating = mongoose.model("Rating", ratingSchema);
module.exports = Rating;
