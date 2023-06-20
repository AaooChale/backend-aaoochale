const path = require("path");
const catchAsync = require(path.join(__dirname, "..", "utils", "catchAsync"));
const AppErr = require(path.join(__dirname, "..", "utils", "AppErr"));
const User = require(path.join(__dirname, "..", "model", "userModel"));
const notificationController = require("../notification/notificationController");
const notificationModel = require("../model/notificationSchema");
const Rating = require("../model/ratingModel");
var ObjectId = require('mongodb').ObjectID;
const Ride = require("../model/rideModel");
const BookedRide = require("../model/rideBookingModel");
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

// add user personal info
exports.addUserPersoInfo = async (req, res, next) => {
  const { id, firstName, lastName, emailId, city } = req.body;
  if (!id || !firstName || !lastName) {
    return next(new AppErr("Please Provide id, firstName, lastName", 200));
  }
  const user = await User.findByIdAndUpdate(
    { _id: id },
    { ...req.body },
    { runValidator: true, useFindAndModify: false, new: true }
  );
  user.email = { emailId };
  await user.save();
  res.status(200).json({
    status: true,
    data: {
      message: "Add User Personal information",
      user,
    },
  });
};

// user update personal info
exports.updateUserPersoInfo = catchAsync(async (req, res, next) => {
  const { id, firstName, lastName, emailId, gender, DOB, bio, mobileNumber } = req.body;
  if (!id) return next(new AppErr("Pelase Provide User Id"), 200);


  const user = await User.findByIdAndUpdate(
    { _id: id },
    { ...req.body },
    { runValidator: true, useFindAndModify: false, new: true }
  );
  // save data
  await user.save();
  res.status(200).json({
    status: true,
    data: {
      message: "Add User Personal information",
      user,
    },
  });
});


const newrating = (getRating,userId) =>{
  if (userId) {
    const sum = [];
    getRating.map((item) => {
      if(item.driverId.toString() == userId.toString()){
        sum.push(item.startRating);
      }
    });
    let count = 0;
    let total = 0;
    while (count < sum.length) {
      total = total + sum[count];
      count += 1;
    }
    
    var ratingAverage = parseFloat(total / sum.length);
    if( total == 0 || sum.length ==0){
      ratingAverage =0;
    }
    return ratingAverage;
  }else{
    return 0;
  }
}
// get user personal info
exports.getUserPersoInfo = catchAsync(async (req, res, next) => {
  const { id } = req.body;
  if (!id) return next(new AppErr("Pelase Provide User Id"), 200);
  const user = await User.findOne({ _id: id }, "-__v");
  var rat = await Rating.find({ driverId:id });
  let rating = await newrating(rat,id);
  if(user.userStatus == 'Unverified' && (user.documents.aadharCard.documentLink != '' || user.documents.panCard.documentLink != '' || user.documents.drivingLicence.documentLink != '')){
    var finaluser = {...user._doc,rating:rating,userStatus:"Pending"};
  }else{
    var finaluser = {...user._doc,rating:rating};
  }
  res.status(200).json({
    status: true,
    data: {
      message: "Get User Personal information",
      user:finaluser,
    },
  });
});

// update personal information
exports.updateUserPreferences = catchAsync(async (req, res, next) => {
  const { id, chattiness, music, smoking, pets } = req.body;
  if (!id) return next(new AppErr("Pelase Provide User Id"), 200);

  const user = await User.findByIdAndUpdate(
    { _id: id },
    { ...req.body },
    { runValidator: true, useFindAndModify: false, new: true }
  );
  // save data
  await user.save();
  res.status(200).json({
    status: true,
    data: {
      message: "Add User Personal information",
      user,
    },
  });
});

exports.notificationByEmail = catchAsync(async (req, res, next) => {
  const { id } = req.body;
  if (!id) return next(new AppErr("Pelase Provide User Id"), 200);
  const user = await User.findOne({ _id: id });

  const notification = await notificationModel.find({ sender: id }, { type: "Self" });
  if (user.email.emailId != "" && notification.length != 0) {
    res.status(200).json({
      status: true,
      data: {
        message: "User EmailId already Updated...",
      },
    });
  } else if (user?.email?.isEmailVerified == false) {
    var checkNotification = await notificationModel.findOne({sender:user._id,message:"Please Add and verify your EmailId."}).sort({createdOn:-1});
    var checkday = (checkNotification != null) ? new Date(checkNotification) : new Date();
    checkday.setDate(checkday.getDate()+1);
    if((new Date() > new Date(checkday)) || checkNotification==null){
      await notificationController.postNotificationSelf(id, "Self", "Please Add and verify your EmailId.","EmailId");

      if (id) {
        var content = {
          title: "Email Id",
          body: "Please Add and verify your EmailId.",
          image: "https://www.designbombs.com/wp-content/uploads/2021/07/How-to-Create-an-Anonymous-Email-and-Keep-Your-Identity-Safe-Online.png",
        };
        const key = await GetToken(id);

        if (key != "") {
          var firebaseres = await firebase.sendNotification(key, content);
        }
      }
    }
    res.status(200).json({
      status: true,
      data: {
        message: "Please Add verify your EmailId",
      },
    });
  } else {
    res.status(200).json({
      status: true,
      data: {
        message: "User EmailId already Updated",
      },
    });
  }
});


exports.notificationByprofilePicture = async (req, res, next) => {
  const { id } = req.body;
  if (!id) return next(new AppErr("Pelase Provide User Id"), 200);
  const user = await User.findOne({ _id: id });

  const notification = await notificationModel.find({ sender: id }, { type: "Self" });

  if (user.profilePicture == "" && notification.length != 0) {
    res.status(200).json({
      status: true,
      data: {
        message: "Please Add your profilePicture....",
      },
    });
  } else if (user.profilePicture == "") {
    var checkNotification = await notificationModel.findOne({sender:user._id,message:"Please update your profile picture people want to know who they’re going to travel with him."}).sort({createdOn:-1});
    var checkday = (checkNotification != null) ? new Date(checkNotification) : new Date();
    checkday.setDate(checkday.getDate()+1);
    if((new Date() > new Date(checkday)) || checkNotification==null){
      await notificationController.postNotificationSelf(id, "Self", "Please update your profile picture people want to know who they’re going to travel with him.","ProfilePicture");

      //
      if (id) {
        var content = {
          title: "Profile Picture",
          body: "Please update your profile picture people want to know who they’re going to travel with him.",
          image: "https://i.pinimg.com/236x/d9/56/9b/d9569bbed4393e2ceb1af7ba64fdf86a.jpg",
        };
        const key = await GetToken(id);

        if (key != "") {
          var firebaseres = await firebase.sendNotification(key, content);
        }
      }
    }
    res.status(200).json({
      status: true,
      data: {
        message: "Please Add your profilePicture",
      },
    });
  } else {
    res.status(200).json({
      status: true,
      data: {
        message: "User profilePicture already uploaded",
      },
    });
  }
};


exports.ratingReviews = async (req,res,next) =>{
  try{
    var {userId} = req.body;
    userId = new ObjectId(userId);
    const ratings = await Rating.aggregate([
      {$lookup:
        {
          from:'users',
          localField:'userId',
          foreignField:'_id',
          as:'reviewer'
        }
      },
      {$match:{driverId:userId}},
      {$sort:{createdOn:-1}}
    ]);
    var rating = {};
    rating.star5 = 0;
    rating.star4 = 0;
    rating.star3 = 0;
    rating.star2 = 0;
    rating.star1 = 0;
    rating.datas = ratings.map((rate)=>{
      r = {
        ...rate,
        reviewer:{
          _id:rate.reviewer[0]._id,
          name:`${rate.reviewer[0].firstName} ${rate.reviewer[0].lastName}`,
          profilePicture:rate.reviewer[0].profilePicture,
          mobile:rate.reviewer[0].mobile.mobileNumber,
          email:rate.reviewer[0].email.emailId,
        }
      }
      if(rate.startRating ==5){
        rating.star5++;
      }else if(rate.startRating ==4){
        rating.star5++;
      }else if(rate.startRating ==3){
        rating.star5++;
      }else if(rate.startRating ==2){
        rating.star5++;
      }else if(rate.startRating ==1){
        rating.star5++;
      }
      return r;
    });
    rating.averageRating = await newrating(ratings,userId);
    res.status(200).json({
      status: true,
      data: {
        message: "User profilePicture already uploaded",
        rating
      },
    });
  } catch (error){
    next(error);
  }
}

exports.userActivityRideAndRating = async (req,res,next)=>{
  try{
    const {userId} = req.body;
    var datas = {
      ratinGiven:0,
      ratingReceived:0,
      ridePublished:0,
      rideBooked:0,
    }
    datas.ratinGiven = await Rating.find({userId:userId}).count();
    datas.ratingReceived = await Rating.find({driverId:userId}).count();
    datas.ridePublished = await Ride.find({userId:userId,rideStatus:{$ne:'Cancel'}}).count();
    datas.rideBooked = await BookedRide.find({user:userId,status:{$ne:'Cancel'}}).count();
    res.status(200).json({
      status:true,
      message:"Activity Report get Successfully!!",
      data:datas
    });
  } catch (error) {
    next(error);
  }
}

exports.addAlternateNumber = async (req,res,next) => {
  try {
    const { userId,mobile,mobileRelative } = req.body;
    const user = await User.findByIdAndUpdate(
      { _id: userId },
      { alternateMobile:mobile,mobileRelative:mobileRelative },
      { runValidator: true, useFindAndModify: false, new: true }
    );
    res.status(200).json({
      status:true,
      message:"Alternate Mobile Updated Successfully!!",
      data:user
    });
  } catch  (error) {
    next(error);
  }
}
