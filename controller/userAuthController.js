const path = require("path");
const jwt = require("jsonwebtoken");
require("dotenv").config({ path: path.join(__dirname, "..", "config.env") });
const { promisify } = require("util");
const { generateOtp, generateOtpMobile } = require(path.join(__dirname, "..", "helpers", "generateOtp"));
const catchAsync = require(path.join(__dirname, "..", "utils", "catchAsync"));
const AppErr = require(path.join(__dirname, "..", "utils", "AppErr"));
const User = require(path.join(__dirname, "..", "model", "userModel"));
const notificationController = require("../notification/notificationController");
const notificationModel = require("../model/notificationSchema");
const countrySchema = require("../model/countrySchema");
const Helper = require("../config/Helper");
const fs = require('fs');
const AWS = require('aws-sdk');
const nodemailer = require("nodemailer");
const schedule = require('node-schedule');
require("dotenv").config();
const Token = require("../model/fireBaseSchema");
const firebase = require("../notification/firebase");

const GetToken = async (userId) => {
  const list = await Token.find({ user_id: userId });

  if (list.length > 0) {
    return list[0].token;
  } else {
    var token = "";
    return token;
  }
};


/// image upload
const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: "dyetuvbqa",
  api_key: "931785857465896",
  api_secret: "hEnL1zZDYVp65zn-S3ZEy66B0bs",
  secure: true,
});



const signToken = (id) => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};
const createSendToken = async (user, statusCode, res) => {
  const payload = `${user}--${user._id}`;

  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
    httpOnly: true,
  };
  const startTime = new Date(Date.now() + (1000*60*30));//cron Start Time
  const endTime = new Date(startTime.getTime() + 1000);//cron End Time
  if(user.profilePicture == ""){
    var checkNotification = await notificationModel.findOne({sender:user._id,message:"Please update your profile picture people want to know who they’re going to travel with him."}).sort({createdOn:-1}).exec();
    var checkday = (checkNotification != null) ? new Date(checkNotification) : new Date();
    checkday.setDate(checkday.getDate()+1);
    if((new Date() > new Date(checkday)) || checkNotification==null){
      schedule.scheduleJob({ start: startTime, end: endTime, rule: '*/1 * * * * *' }, async function(){
      
       await notificationController.postNotificationSelf(user._id, "Self", "Please update your profile picture people want to know who they’re going to travel with him.",'ProfilePicture');
        //
        if (user._id) {
          var content = {
            title: "Profile Picture",
            body: "Please update your profile picture people want to know who they’re going to travel with him.",
            image: "https://i.pinimg.com/236x/d9/56/9b/d9569bbed4393e2ceb1af7ba64fdf86a.jpg",
          };
          const key = await GetToken(user._id);

          if (key != "") {
            var firebaseres = await firebase.sendNotification(key, content);
          }
        }
      });
    }
  } else if (user?.email?.isEmailVerified == false) {
    var checkNotification = await notificationModel.findOne({sender:user._id,message:"Please Add and verify your EmailId."}).sort({createdOn:-1});
    var checkday = (checkNotification != null) ? new Date(checkNotification) : new Date();
    checkday.setDate(checkday.getDate()+1);
    if((new Date() > new Date(checkday)) || checkNotification==null){
      schedule.scheduleJob({ start: startTime, end: endTime, rule: '*/1 * * * * *' }, async function(){
        await notificationController.postNotificationSelf(user._id, "Self", "Please Add and verify your EmailId.","EmailId");

        if (user._id) {
          var content = {
            title: "Email Id",
            body: "Please Add and verify your EmailId.",
            image: "https://www.designbombs.com/wp-content/uploads/2021/07/How-to-Create-an-Anonymous-Email-and-Keep-Your-Identity-Safe-Online.png",
          };
          const key = await GetToken(user._id);

          if (key != "") {
            var firebaseres = await firebase.sendNotification(key, content);
          }
        }
      });
    }
  }
  res.cookie("jwt", token, cookieOptions);
  user.password = undefined; // hide password field from the response of document
  res.status(statusCode).json({
    status: "success",
    token: token,
    user: user,
  });
};

// login with otp
exports.login = catchAsync(async (req, res, next) => {
  // TODO:NO LOGIN TILL EMAIL VERIFIED
  const {
    mobileNumber,
    firstName,
    lastName,
    userStatus,
    adminUserStatus,
    profilePicture,
    gender,
    DOB,
    bio,
    emailId,
    chattiness,
    music,
    smoking,
    pets,
    documents,
  } = req.body;
  if (!mobileNumber) {
    return next(new AppErr("Please Provide all the details to create user", 200));
  }
  let doc = await User.findOne({ "mobile.mobileNumber": mobileNumber });
  if (doc) {
    try {
      await generateOtp("mobile", doc);
    } catch (err) {
      return res.status(500).json({
        status: false,
        message: "Unable To Send Otp, Please Try Later....",
      });
    }
    res.status(200).json({
      status: true,
      data: {
        message: "Account already exits An OTP has been sent your mobile Number",
      },
    });
  } else {
    const user = await User.create({
      mobile: { mobileNumber },
      email: { emailId: "" } || "",
      firstName: firstName || "",
      lastName: lastName || "",
      profilePicture: profilePicture || "",
      userStatus: userStatus || "Unverified",
      adminUserStatus: adminUserStatus || false,
      bio: bio || "",
      chattiness: chattiness || "",
      music: music || "",
      smoking: smoking || "",
      pets: pets || "",
      documents:
        {
          aadharCard: {
            documentName: "",
            documentLink: "",
            documentLink1: "",
          },
          panCard: {
            documentName: "",
            documentLink: "",
          },
          drivingLicence: {
            documentName: "",
            documentLink: "",
            documentLink1: "",
          },
        } || "",
    });

    try {
      await generateOtp("mobile", user);
    } catch (err) {
      return res.status(200).json({
        status: false,
        message: "Unable To Send Otp, Please Try Later....",
      });
    } res.status(200).json({
      status: true,
      data: {
        message: "Account Create successfully and OTP has been sent Your Mobile",
      },
    });
  }
});

// create jwt by using mobile otp
exports.loginMobileOTP = catchAsync(async (req, res, next) => {
  const { mobile, otp } = req.body;
  if (!mobile || !otp) {
    res.status(200).json({
      status: false,
      data: {
        message: "Please Provide All The Details",
      },
    });
  }
  const doc = await User.findOne({ "mobile.mobileNumber": mobile });

  const currDate = new Date(Date.now());
  if (doc?.verificationToken?.mobileTokenExpiry < currDate) return next(new AppErr("OTP Expired", 200));
  if ((doc?.profileStatus!= '' || doc?.profileStatus != null ) && doc?.profileStatus == false) return next(new AppErr("Account has been blocked, Contact Administrator!!", 200));
  // verify otp
  if (!(doc?.verificationToken?.mobileToken === otp)) return next(new AppErr("OTP Entered Is Incorrect", 200));
  // update token fields in document
  doc.verificationToken.mobileToken = undefined;
  doc.verificationToken.mobileTokenExpiry = undefined;
  doc.mobile.isMobileVerified = true;
  let user = await doc.save();
  // check mobile is very or not
  if (!user?.mobile?.isMobileVerified) return next(new AppErr("Please Verify Your Mobile Address To Login", 200));

  createSendToken(user, 200, res);
});

//PROTECT route to chake user is login or not
exports.protect = catchAsync(async (req, res, next) => {
  //1) Getting the tocken and check is it exist
  let token;
  if (
    // autharization = "Bearer TOKEN_STRING"
    req?.headers?.authorization &&
    req?.headers?.authorization?.startsWith("Bearer")
  ) {
    token = req?.headers?.authorization?.split(" ")[1];
  } else if (req?.cookies?.jwt) {
    token = req?.cookies?.jwt;
    const cookieToken = req?.cookies?.jwt;
  }
  if (!token) {
    return next(new AppErr("You are not logged  in!!! Please log in to get access.", 200));
  }

  //2) Validate token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  const id = decoded?.id?.split("--")[1];
  if (!id) return next(new AppErr("JWT Malformed"), 200);
  const currentUser = await User.findById(id);

  if (!currentUser) {
    return next(new AppErr(" The user blonging to this token no longer exists", 200));
  }

  if (currentUser.changePasswordAfter(decoded.iat)) {
    return next(new AppErr("App user recently changed password! Please log in again", 200));
  }
  req.user = currentUser;
  req.identity = id;
  next();
});

// FORGOT PASSWORD STAGES
// 1) verify email
exports.forgotPwdGenerateOtp = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    res.status(200).json({
      status: false,
      data: {
        message: "Please Provide All The Details",
      },
    });
  }
  const user = await User.findOne({ "email.emailId": email });
  if (!user) return next(new AppErr("Account Not Found"), 200);
  await generateOtp("email", user);
  res.status(200).json({
    status: true,
    data: {
      verificationToken: user.verificationToken,
      message: "An OTP has been sent,Please Verify Email",
    },
  });
});
// 2) verify otp email
exports.forgotPwdVerifyOtp = catchAsync(async (req, res, next) => {
  const { otp, email } = req.body;
  if (!email) {
    res.status(200).json({
      status: false,
      data: {
        message: "Please Provide All The Details",
      },
    });
  }
  const doc = await User.findOne({ "email.emailId": email });
  if (!doc) return next(new AppErr("Account Not Found"), 200);
  if (!doc?.verificationToken?.emailToken && !doc?.verificationToken?.emailTokenExpiry)
    return next(new AppErr("Token Not Issued, Route Is FORBIDDEN", 200));
  const currDate = new Date(Date.now());
  if (doc?.verificationToken?.emailTokenExpiry < currDate) return next(new AppErr("OTP Expired", 200));
  if (!(doc?.verificationToken?.emailToken === otp)) return next(new AppErr("OTP Entered Is Incorrect", 200));
  doc.verificationToken.emailToken = undefined;
  doc.verificationToken.emailTokenExpiry = undefined;
  doc.email.isEmailVerified = true;
  await doc.save();
  res.status(200).json({
    status: true,
    data: {
      message: "User Email Verified",
      doc,
    },
  });
  createSendToken(doc, 200, res);
});

exports.verifyMobileSendOtp = catchAsync(async (req, res, next) => {
  const { mobile } = req.body;
  if (!mobile) {
    res.status(200).json({
      status: false,
      data: {
        message: "Please Provide All The Details",
      },
    });
  }
  const user = await User.findOne({ "mobile.mobileNumber": mobile });
  if (!user) return next(new AppErr("Account Not Found"), 200);
  await generateOtp("mobile", user);
  res.status(200).json({
    status: true,
    data: {
      message: "An OTP has been sent,Please Verify OTP To verify mobile",
    },
  });
});

// verify mobile otp
exports.verifyReceivedMobileOTP = catchAsync(async (req, res, next) => {
  const { otp, mobile } = req.body;
  if (!mobile) {
    res.status(200).json({
      status: false,
      data: {
        message: "Please Provide All The Details",
      },
    });
  }
  const doc = await User.findOne({ "mobile.mobileNumber": mobile });
  if (!doc) return next(new AppErr("Account Not Found"), 200);
  if (!doc?.verificationToken?.mobileToken && !doc?.verificationToken?.mobileTokenExpiry)
    return next(new AppErr("Token Not Issued, Route Is FORBIDDEN", 200));
  const currDate = new Date(Date.now());
  if (doc?.verificationToken?.mobileTokenExpiry < currDate) return next(new AppErr("OTP Expired", 200));
  if (!(doc?.verificationToken?.mobileToken === otp)) return next(new AppErr("OTP Entered Is Incorrect", 200));
  doc.verificationToken.mobileToken = undefined;
  doc.verificationToken.mobileTokenExpiry = undefined;
  doc.mobile.isMobileVerified = true;
  await doc.save();
  res.status(200).json({
    status: true,
    data: {
      message: "User Mobile Verified",
      doc,
    },
  });

  createSendToken(doc, 200, res);
});

// logout
exports.logout = catchAsync(async (req, res, next) => {
  res.cookie("jwt", "loggedOut", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({
    status: true,
    data: {
      message: "User Successfully Logged Out",
    },
  });
});

exports.updateMobile = catchAsync(async (req, res, next) => {
  const { id,mobileNumber } = req.body;
  try {
    const user = await User.findById({ _id: id });
    var data = await generateOtpMobile("mobile", mobileNumber, user);
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: "Unable To Send Otp, Please Try Later....",
    });
  }
  res.status(200).json({
    status: true,
    data: {
      message: "Otp send your Number",
      data,
    },
  });
});

exports.verifyUpdateMobile = async (req, res, next) => {
  const { id, otp, mobileNumber } = req.body;
  try {
    if (!mobileNumber || !id || !otp) {
      res.status(200).json({
        status: false,
        data: {
          message: "Please Provide All The Details",
        },
      });
    }
    const user = await User.findOne({ _id: id });
    const currDate = new Date(Date.now());
    if (user?.verificationToken?.mobileTokenExpiry < currDate) return next(new AppErr("OTP Expired", 200));
    if (!(user?.verificationToken?.mobileToken === otp)) return "OTP Entered Is Incorrect", 200;
    user.verificationToken.mobileToken = undefined;
    user.verificationToken.mobileTokenExpiry = undefined;
    user.mobile = { mobileNumber,isMobileVerified: true };
    const doc = await user.save();
    res.status(200).json({
      status: true,
      data: {
        message: "User Mobile Verified",
        doc,
      },
    });
  } catch (err) {
    return res.status(200).json({
      status: true,
      message: "Please Enter Valid Mobile Number",
    });
  }
};

// ///// images
const s3 = new AWS.S3({
  accessKeyId: process.env.S3_ACCESS_KEY,
  secretAccessKey: process.env.S3_SECRETE_ACCESS_KEY,
  region: process.env.S3_BUCKET_RESION,
  // signatureVersion: "v4",
});


exports.uploadUsertImage = async (req, res) => {
  try{
    const { id } = req.body;
    const file = req.files.profileimage;
    if (!id) return next(new AppErr("Pelase Provide vehicle Id"), 200);
    Helper.imageUploadS3(file.tempFilePath,'userImage/'+id)
    .then(async (location)=>{
      const user = await User.findOne({ _id: id });
      user.profilePicture = location;
      await user.save();
      res.status(200).json({
        status: true,
        data: {
          message: "Upload User Image Successfully",
        },
      });
    }).catch((err)=>{
      res.status(200).json({
        status:false,
        message:"Some Error Occured!!",
        data:{errors:err}
      });
    });
  } catch (error) {
    next(error);
  }
};

exports.uploadPanCard = async (req, res, next) => {
  const { id, documentName } = req.body;
  const file = req.files.document;
  if (!id) {
    res.status(200).json({
      status: false,
      data: {
        message: "Please Provide UserID",
      },
    });
  } else {
    Helper.imageUploadS3(file.tempFilePath,'userDocImage/'+documentName+''+id)
    .then(async (location)=>{
      const user = await User.findOne({ _id: id });
      user["documents"][documentName]["documentName"] = documentName;
      user["documents"][documentName]["documentLink"] = location;
      user.userStatus = "Unverified";
      await user.save();
      res.status(200).json({
        status: true,
        data: {
          message: "Upload Document Successfully",
        },
      });
    }).catch((err)=>{
      res.status(200).json({
        status:false,
        message:"Some Error Occured!!",
        data:{errors:err}
      });
    });
  }
};
exports.uploadUserDocuments = async (req, res, next) => {
  const { id, documentName } = req.body;
  const file = req.files.document;
  const file1 = req.files.document1;
  if (!id) {
    res.status(200).json({
      status: false,
      data: {
        message: "Please Provide UserID",
      },
    });
  } else if (!documentName) {
    res.status(200).json({
      status: false,
      data: {
        message: "Please Provide Document Name",
      },
    });
  } else {
    Helper.imageUploadS3(file.tempFilePath,'userDocImage/'+documentName+''+id)
    .then(async (location)=>{
      Helper.imageUploadS3(file1.tempFilePath,'userDocImage/'+documentName+'1'+id)
      .then(async (location1)=>{
        const user = await User.findOne({ _id: id });
        user["documents"][documentName]["documentName"] = documentName;
        user["documents"][documentName]["documentLink"] = location;
        user["documents"][documentName]["documentLink1"] = location1;
        user.userStatus = "Unverified";
        await user.save();
        res.status(200).json({
          status: true,
          data: {
            message: "Upload Document Successfully",
          },
        });
      }).catch((err)=>{
        res.status(200).json({
          status:false,
          message:"Some Error Occured!!",
          data:{errors:err}
        });
      });
    }).catch((err)=>{
      res.status(200).json({
        status:false,
        message:"Some Error Occured!!",
        data:{errors:err}
      });
    });
  }
};

exports.getUserStatus = async (req, res, next) => {
  try {
    const { userId } = req.body;
    if (!userId) return next(new AppErr("Please Provide userId", 200));
    const user = await User.findOne({ _id: userId }).select("firstName lastName userStatus adminUserStatus");
    res.status(200).json({
      status: true,
      user,
    });
  } catch (err) {
    next(err);
  }
};

// google login
exports.googleLogin = async (req, res, next) => {
  const {
    mobileNumber,
    firstName,
    lastName,
    userStatus,
    adminUserStatus,
    profilePicture,
    gender,
    DOB,
    bio,
    emailId,
    chattiness,
    music,
    smoking,
    pets,
    documents,
  } = req.body;
  try {
    const user = await User.findOne({ "email.emailId": emailId });
    if (user) {
      if ((user?.profileStatus!= '' || user?.profileStatus != null ) && user?.profileStatus == true) return next(new AppErr("Account has been blocked, Contact Administrator!!", 200));
      res.status(200).json({
        status: true,
        user,
      });
    } else {
      const user = await User.create({
        mobile: { mobileNumber: "", isMobileVerified: false } || "",
        email: { emailId, isEmailVerified: true } || "",
        firstName: firstName || "",
        lastName: lastName || "",
        profilePicture: profilePicture || "",
        userStatus: userStatus || "Unverified",
        adminUserStatus: adminUserStatus || false,
        bio: bio || "",
        chattiness: chattiness || "",
        music: music || "",
        smoking: smoking || "",
        pets: pets || "",
        documents: {
          aadharCard: {
            documentName: "",
            documentLink: "",
            documentLink1: "",
          },
          panCard: {
            documentName: "",
            documentLink: "",
          },
          drivingLicence: {
            documentName: "",
            documentLink: "",
            documentLink1: "",
          },
        },
      });
      res.status(200).json({
        status: true,
        user,
      });
    }
  } catch (err) {
    next(err);
  }
};

exports.updateCurrentLocation = async (req,res,next) => {
  try {
    const { longitude,latitude,currentAddress,userId } = req.body;
    const userSave = await User.findByIdAndUpdate(
        { _id: userId },
        { 
          longitude       : longitude,
          latitude        : latitude,
          currentAddress  : currentAddress,
        },
        { runValidator: true, useFindAndModify: false, new: true }
    );
    await userSave.save();
    Helper.response(true,'Current Location Updated Successfully!!',{},res,200);
  } catch (error) {
    next(err);
  }
}

exports.countryList = async (req,res,next)=>{
  
  try {
    const countries = await countrySchema.find({});
      res.status(200).json({
        status: true,
        countries,
      });
  } catch (err) {
    next(err);
  }
}

exports.sendMailTesting = async (req,res,next) =>  {
//   var transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//         user: 'abhinictjsr@gmail.com',
//         pass: 'ozfixtajnebszgjp'
//     }
// });

// var mailOptions = {
//     from: 'abhinictjsr@gmail.com',
//     to: "abhinictjsr63@gmail.com",
//     subject: "subject",
//     html: "content",
// };

// transporter.sendMail(mailOptions, function(error, info){
//   if (error) {
//       res.send(error);
//   } else {
//     //res.send(info.response);
//     res.send('Email sent: ' + info.response);
//   }
// });

var transporter = nodemailer.createTransport({
    host: 'mail.aaoochale.com',
  port: 465,
  secure: true,
  auth: {
      user: 'noreply@aaoochale.com',
      pass: 'Aaochale111!'
  },
  tls:{
    rejectUnauthorized: false
  }
});

var mailOptions = {
  from: 'noreply@aaoochale.com',
  to: 'no-reply@aaoochale.com',
  subject: "subject",
  html: "content",
};

transporter.sendMail(mailOptions, function(error, info){
  if (error) {
      res.send(error);
  } else {
    //res.send(info.response);
    res.send('Email sent: ' + info.response);
  }
}); 

}




exports.s3test = async (req,res,next) =>{
  try{
    // const countries = await countrySchema.find({});
    // await countries.map(async (country)=>{
    //   //By Url
    //   const imageURL = `http://localhost/img/32x32/${country.code}.png`;
    //   const res1 = await fetch(imageURL)
    //   const blob = await res1.buffer()

    //   // //By Image Path
    //   // // const imagePath = req.files.file.tempFilePath
    //   // // const blob = fs.readFileSync(imagePath)

    //   const uploadedImage = await s3.upload({
    //     Bucket: process.env.AWS_S3_BUCKET,
    //     Key: `countryFlag/${country.code}.png`,
    //     Body: blob,
    //   }).promise()

    //   await countrySchema.findByIdAndUpdate(
    //     { _id: country._id },
    //     { image: uploadedImage.Location }
    //   );
    //   // res.send({file:imageURL,newpath:uploadedImage.Location});
    //   // res.send(req.files.file.tempFilePath);
    

    // });
    res.send("done");
    // const base64FilePath = "data:image/gif;base64,"+fs.readFileSync(req.files.file.tempFilePath, 'base64');

    // // Ensure that you POST a base64 data to your server.
    // // Let's assume the variable "base64" is one.
    // const base64Data = new Buffer.from(base64FilePath.replace(/^data:image\/\w+;base64,/, ""), 'base64');
  
    // // Getting the file type, ie: jpeg, png or gif
    // const type = base64FilePath.split(';')[0].split('/')[1];
  
    // // Generally we'd have an userId associated with the image
    // // For this example, we'll simulate one
    // const userId = 1;
    // const params = {
    //   Bucket: process.env.AWS_S3_BUCKET,
    //   Key: `${userId}.${type}`, // type is not required
    //   Body: base64Data,
    //   ACL: 'public-read',
    //   ContentEncoding: 'base64', // required
    //   ContentType: `image/${type}` // required. Notice the back ticks
    // }
    // // The upload() is used instead of putObject() as we'd need the location url and assign that to our user profile/database
    // // see: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#upload-property
    // let location = '';
    // let key = '';
    //   const { Location, Key } = await s3.upload(params).promise();
    //   location = Location;
    //   key = Key;
    //   // console.log(error)
    
    // // Save the Location (url) to your database and Key if needs be.
    // // As good developers, we should return the url and let other function do the saving to database etc
    // console.log(location, key);
    
    // Helper.imageUploadS3(req.files.file.tempFilePath,'image/abc')
    // .then((location)=>{
      
    // res.send(location);
    // }).catch((err)=>{
    //   res.send(err);
    // });
  } catch (err) {
    next(err);
  }
}

exports.queueTest = (req,res,next)=>{
  try {
    // setTimeout(()=>{
    //   console.log('Working Here');
    // },(60*1000*1))
    const startTime = new Date(Date.now() + 5000);
    const endTime = new Date(startTime.getTime() + 1000);
    const job = schedule.scheduleJob({ start: startTime, end: endTime, rule: '*/1 * * * * *' }, function(){
      console.log('Time for tea!');
    });
    res.send("okk");
  } catch (error) {
    next(error);
  }
}
