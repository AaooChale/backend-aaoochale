const mongoose = require("mongoose");
const path = require("path");
const getISTTime = require(path.join(__dirname, "..", "helpers", "getISTTime"));
const Schema = mongoose.Schema;
const countrySchema = new Schema(
  {
    name: {
      type: String,index:true
    },
    code: {
      type: String,index:true
    },
    emoji: {
      type: String,index:true
    },
    unicode: {
      type: String,index:true
    },
    image: {
      type: String,index:true
    },
  },
  { toJSON: { virtuals: true } }
);

const Country = mongoose.model("countries", countrySchema);
module.exports = Country;
