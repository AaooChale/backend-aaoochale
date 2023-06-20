const mongoose = require("mongoose");
const path = require("path");
const getISTTime = require("../helpers/getISTTime");
const Schema = mongoose.Schema;

// HELPER FUNCTION
function monthDiff(d1, d2) {
  let months;
  months = (d2.getFullYear() - d1.getFullYear()) * 12;
  months -= d1.getMonth();
  months += d2.getMonth();
  return months <= 0 ? 0 : months;
}

const userModel = new Schema(
  {
    firstName: {
      type: String,
      required: [false, "Please Provide First Name"],
    },
    lastName: {
      type: String,
      required: [false, "Please Provide First Name"],
    },
    userStatus: {
      type: String,
      enum: ["Verified", "Unverified"],
      required: [false, "Please Provide verified"],
    },
    adminUserStatus: {
      type: Boolean,
    },
    profilePicture: String,
    createdOn: {
      type: Date,
      default: getISTTime(new Date(Date.now())),
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
    },
    DOB: {
      type: Date,
      default: getISTTime(new Date(Date.now())),
    },
    bio: {
      type: String,
    },
    city: {
      type: String,
    },

    email: {
      emailId: {
        type: String,
        unique: [false, "Email Id Already Exists"],
        required: [false, "Please Provide Email ID"],
      },
      isEmailVerified: {
        type: Boolean,
        default: false,
      },
    },
    mobile: {
      mobileNumber: {
        type: String,
        unique: [false, "Mobile Number Already Exists"],
        required: [false, "Please Provide Mobile Number"],
      },
      isMobileVerified: {
        type: Boolean,
        default: false,
      },
    },
    verificationToken: {
      emailToken: String,
      emailTokenExpiry: Date,
      mobileToken: String,
      mobileTokenExpiry: Date,
      passwordToken: String,
      passwordTokenExpiry: Date,
    },
    chattiness: {
      type: String,
    },
    music: {
      type: String,
    },
    smoking: {
      type: String,
    },
    pets: {
      type: String,
    },
    documents: {
      aadharCard: {
        documentName: String,
        documentLink: String,
        documentLink1: String,
      },
      panCard: {
        documentName: String,
        documentLink: String,
      },
      drivingLicence: {
        documentName: String,
        documentLink: String,
        documentLink1: String,
      },
    },
    alternateMobile: {
      type: String,
    },
    mobileRelative: {
      type: String,
    },
    longitude:{
      type: String,
    },
    latitude:{
      type: String,
    },
    currentAddress:{
      type: String,
    },
    profileStatus:{
      type: Boolean,
      default:true
    }
  },
  { toJSON: { virtuals: true } }
);
userModel.methods.changePasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimeStamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimeStamp;
  }
  return false; 
};

const User = mongoose.model("User", userModel);
module.exports = User;
