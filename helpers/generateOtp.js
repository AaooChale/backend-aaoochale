const path = require("path");
const axios = require("axios");
require("dotenv").config({ path: path.join(__dirname, "..", "config.env") });
const Email = require(path.join(__dirname, "..", "utils", "Email"));

const generateOtp = async function (mode, user) {
  const otp = Math.floor(1000 + Math.random() * 1000);
  const date = Date.now() + 10 * 60 * 1000;
  user[`verificationToken`][`${mode}Token`] = otp;
  user[`verificationToken`][`${mode}TokenExpiry`] = date;
  await user.save();
  
  if (mode === "email") {
    try {
      await new Email(user, otp).send();
    } catch (error) {
      console.log("EMAIL ERROR", error);
    }
  }
  if (mode === "mobile") {
    const mobileNumber = user.mobile.mobileNumber;
    try {

      let masg = `${otp}%20is%20your%20Aaoo%20Chale%20Login%20OTP.%0APlease%20do%20not%20share%20it%20with%20anyone.%0A%0ATeam%0AAaoo%20Chale`;
      axios.post(
        `http://webpostservice.com/sendsms_v2.0/sendsms.php?apikey=ZHJlYW1wbGFUOkg5WmlCRFZJ&type=TEXT&sender=AOCHLE&mobile=${mobileNumber}&message=${masg}`
      );
    } catch (err) {
      return res.status(200).json([{ msg: err.message, res: "error" }]);
    }
  }
};

//
const generateOtpMobile = async function (mode, mobileNumber, user) {
  const otp = Math.floor(1000 + Math.random() * 1000);
  const date = Date.now() + 10 * 60 * 1000;
  user[`verificationToken`][`${mode}Token`] = otp;
  user[`verificationToken`][`${mode}TokenExpiry`] = date;
  await user.save();
  if (mode === "email") {
    try {
      await new Email(user, otp).send();
    } catch (error) {
      console.log("EMAIL ERROR", error);
    }
  }
  if (mode === "mobile") {
    try {
      
      let masg = `${otp}%20is%20your%20Aaoo%20Chale%20Login%20OTP.%0APlease%20do%20not%20share%20it%20with%20anyone.%0A%0ATeam%0AAaoo%20Chale`;
      axios.post(
        `http://webpostservice.com/sendsms_v2.0/sendsms.php?apikey=ZHJlYW1wbGFUOkg5WmlCRFZJ&type=TEXT&sender=AOCHLE&mobile=${mobileNumber}&message=${masg}`
      );
    } catch (err) {
      return res.status(200).json([{ msg: err.message, res: "error" }]);
    }
  }
};

const sendMsgMobile = async function (mobileNumber, message) {
  try{

    axios.post(
      `http://webpostservice.com/sendsms_v2.0/sendsms.php?apikey=ZHJlYW1wbGFUOkg5WmlCRFZJ&type=TEXT&sender=AOCHLE&mobile=${mobileNumber}&message=${message}`
    );

  } catch (err) {
    return res.status(200).json([{ msg: err.message, res: "error" }]);
  }
};
module.exports = { generateOtp, generateOtpMobile,sendMsgMobile };
