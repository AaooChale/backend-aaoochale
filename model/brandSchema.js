const mongoose = require("mongoose");
const path = require("path");
const getISTTime = require(path.join(__dirname, "..", "helpers", "getISTTime"));
const User = require("../model/userModel");
const Ride = require("../model/rideModel");
const Schema = mongoose.Schema;
const brandSchema = new Schema(
  {
    brandName: {
      type: String,
      required: [false, "Please Provide brandName"],
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

const Brand = mongoose.model("Brand", brandSchema);
module.exports = Brand;
