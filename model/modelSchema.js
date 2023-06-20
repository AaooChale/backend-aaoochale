const mongoose = require("mongoose");
const path = require("path");
const getISTTime = require(path.join(__dirname, "..", "helpers", "getISTTime"));
const User = require("../model/userModel");
const Brand = require("../model/brandSchema");
const Schema = mongoose.Schema;
const modelSchema = new Schema(
  {
    modalName: {
      type: String,
      required: [true, "Please Provide modalName"],
      trim: true,
    },
    brandId: {
      type: mongoose.Schema.ObjectId,
      ref: "Brand",
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

const Model = mongoose.model("Model", modelSchema);
module.exports = Model;
