const path = require("path");
const catchAsync = require(path.join(__dirname, "..", "utils", "catchAsync"));
const AppErr = require(path.join(__dirname, "..", "utils", "AppErr"));
const User = require(path.join(__dirname, "..", "model", "userModel"));
const Ride = require("../model/rideModel");
const BookedRide = require("../model/rideBookingModel");
const RideView = require("../model/rideViewModal");
const Rating = require("../model/ratingModel");
const Helper = require("../config/Helper");
var ObjectId = require('mongodb').ObjectID;
const notificationController = require("../notification/notificationController");
const { sendMsgMobile } = require(path.join(__dirname, "..", "helpers", "generateOtp"));


const Token = require("../model/fireBaseSchema");
const firebase = require("../notification/firebase");
const { aggregate } = require("../model/rideModel");

const GetToken = async (userId) => {
  const list = await Token.find({ user_id: userId });

  if (list.length > 0) {
    return list[0].token;
  } else {
    var token = "";
    return token;
  }
};

exports.bookedRide = async (req, res, next) => {
  try {
    const { userId, receiver, rideId, status, message, passengercount } = req.body;
    if (!userId || !receiver || !rideId || !status || !message || !passengercount)
      return next(new AppErr("Please Provide all details"), 200);
    const approval = await Ride.findOne({ _id: rideId });
    if(approval.rideStatus == 'Cancel'){
      res.status(200).json({
        status: true,
        message: "Ride Can't be booked because ride is Cancelled by the Driver.",
        data: {},
      });
    }
    
    if (approval.totalSeatCount >= passengercount) {
      const recieverData = await User.findOne({_id:receiver});
      if (approval.rideApproval == "Yes") {
        const bookedRide = await BookedRide.create({
          user: userId,
          receiver: receiver,
          ride: rideId,
          message: message,
          pasangerCount: passengercount,
          status: status,
          createdOn: (new Date()).getTime() + 5.5 * 60 * 60 * 1000,
        });
        const seatCount = approval.totalSeatCount - passengercount;
        const updateCount = await Ride.findByIdAndUpdate(
            { _id: rideId },
            { totalSeatCount: seatCount },
            { runValidator: true, useFindAndModify: false, new: true }
          );
        await updateCount.save();
        const userData = await User.findOne({_id:userId});
        var msg = `You have received a new booking by ${(userData?.gender != 'Female') ? 'Mr.' : 'Miss.'} ${userData.firstName || ''} ${userData.lastName || ''} for your ride ${approval.startLocation} to ${approval.endLocation} on ${Helper.dateFormatting(approval.tripDate)}. Contact to ${userData.firstName || ''} ${userData.lastName || ''} for more details...`;
        if(recieverData.mobile.mobileNumber){
          Helper.sendWhatsappNotification(recieverData.mobile.mobileNumber,'booking_received',[
            `${(userData?.gender != 'Female') ? 'Mr.' : 'Miss.'} ${userData.firstName || ''} ${userData.lastName || ''}`,
            `${approval.startLocation} to ${approval.endLocation} on ${Helper.dateFormatting(approval.tripDate)} ${Helper.timeFormatting(approval.tripTime)}`,
            `${(userData?.gender != 'Female') ? 'Mr.' : 'Miss.'} ${userData.firstName || ''} ${userData.lastName || ''}`
          ]);
          sendMsgMobile(recieverData.mobile.mobileNumber,msg);
        }
        const data = await notificationController.postNotification(
          userId,
          receiver,
          "Booking Instant Approval",
          msg,
          "BookingInstantApproval",
        );

        if (receiver) {
          var content = {
            title: "Ride Booking",
            body: msg,
            image: "https://blog.uber-cdn.com/cdn-cgi/image/width=2160,quality=80,onerror=redirect,format=auto/wp-content/uploads/2019/01/UBERIM_Rider_5.1_UAE_17_0272-RT_airport.jpg",
          };
          const key = await GetToken(receiver);
          if (key != "") {
            var firebaseres = await firebase.sendNotification(key, content);
          }
        }

       msg = `Your ride is booked successfully from ${approval.startLocation} to ${approval.endLocation} on ${Helper.dateFormatting(approval.tripDate)}. Contact to ${recieverData.firstName || ''} ${recieverData.lastName || ''} for more details.`;
        await notificationController.postNotificationSelf(
          userId,
          "Self",
          msg,
          "BookingInstantApproval",
        );

        if (userId) {
          var content = {
            title: "Ride Booking",
            body: msg,
            image: "https://blog.uber-cdn.com/cdn-cgi/image/width=2160,quality=80,onerror=redirect,format=auto/wp-content/uploads/2019/01/UBERIM_Rider_5.1_UAE_17_0272-RT_airport.jpg",
          };
          const key = await GetToken(userId);
          if (key != "") {
            var firebaseres = await firebase.sendNotification(key, content);
          }
        }
        res.status(200).json({
          status: true,
          message: "Booked Ride Succussefully",
          data: {
            bookedRide,
          },
        });
      } else {
          const tripPrises = approval.tripPrise * passengercount;
          const bookedRide = await BookedRide.create({
            user: userId,
            receiver: receiver,
            ride: rideId,
            message: "Waiting for Approval",
            pasangerCount: passengercount,
            status: "Waiting",
            createdOn: (new Date()).getTime() + 5.5 * 60 * 60 * 1000,
          });
          const seatCount = approval.totalSeatCount - passengercount;
          const updateCount = await Ride.findByIdAndUpdate(
            { _id: rideId },
            { totalSeatCount: seatCount },
            { runValidator: true, useFindAndModify: false, new: true }
          );
          await updateCount.save();
          
          const userData = await User.findOne({_id:userId});
          var msg = `You have received a new booking request by ${(userData?.gender != 'Female') ? 'Mr.' : 'Miss.'} ${userData.firstName || ''} ${userData.lastName || ''} for your ride ${approval.startLocation} to ${approval.endLocation} on ${Helper.dateFormatting(approval.tripDate)}. Click here to approve or reject.`;
          var msgMobile = `You have received a new booking request by ${(userData?.gender != 'Female') ? 'Mr.' : 'Miss.'} ${userData.firstName || ''} ${userData.lastName || ''} for your ride ${approval.startLocation} to ${approval.endLocation} on ${Helper.dateFormatting(approval.tripDate)}. Please approve or reject ${userData.firstName || ''} ${userData.lastName || ''} ride.`;
          if(recieverData.mobile.mobileNumber){
            Helper.sendWhatsappNotification(recieverData.mobile.mobileNumber,'new_booking_request',[
              `${(userData?.gender != 'Female') ? 'Mr.' : 'Miss.'} ${userData.firstName || ''} ${userData.lastName || ''}`,
              `${approval.startLocation} to ${approval.endLocation} on ${Helper.dateFormatting(approval.tripDate)} ${Helper.timeFormatting(approval.tripTime)}`,
              `${(userData?.gender != 'Female') ? 'Mr.' : 'Miss.'} ${userData.firstName || ''} ${userData.lastName || ''}`
            ]);
            sendMsgMobile(recieverData.mobile.mobileNumber,msgMobile);
          }
          await notificationController.postNotification(
            userId,
            receiver,
            "Booking Approval",
            msg,
            "BookingApproval",
          );

          if (receiver) {
            var content = {
              title: "Ride Booking",
              body: msg,
              image: "http://blog.olacabs.com/wp-content/uploads/2017/08/Share-Pass-GTA-Screenshot.png",
            };
            const key = await GetToken(receiver);
            if (key != "") {
              var firebaseres = await firebase.sendNotification(key, content);
            }
          }
           msg = `Your booking request send successfully from ${approval.startLocation} to ${approval.endLocation} on ${Helper.dateFormatting(approval.tripDate)} is pending ,please wait for driver response.`
          await notificationController.postNotificationSelf(
            userId,
            "Self",
            msg,
            "BookingRequest",
          );

        if (userId) {
          var content = {
            title: "Ride Booking",
            body: msg,
            image: "https://blog.uber-cdn.com/cdn-cgi/image/width=2160,quality=80,onerror=redirect,format=auto/wp-content/uploads/2019/01/UBERIM_Rider_5.1_UAE_17_0272-RT_airport.jpg",
          };
          const key = await GetToken(userId);
          if (key != "") {
            var firebaseres = await firebase.sendNotification(key, content);
          }
        }
          res.status(200).json({
            status: true,
            message: "Booked Ride Succussefully",
            data: {
              tripPrises,
              bookedRide,
            },
          });
      }
    } else {
      res.status(200).json({
        status: true,
        message: `${approval.totalSeatCount} seats only available`,
      });
    }
  } catch (error) {
    next(error);
  }
};

// update booked ride
exports.cancleBookedRide = catchAsync(async (req, res, next) => {
  const { id, status,message } = req.body;
  if (!id || !status) return next(new AppErr("Pelase Provide Id"), 200);
  const updateRide = await BookedRide.findByIdAndUpdate(
    { _id: id },
    { ...req.body },
    { runValidator: true, useFindAndModify: false, new: true }
  );
  var sender = updateRide.user;
  var receiver = updateRide.receiver;
  const ride = await Ride.findOne({_id:updateRide.ride});
  await updateRide.save();
  const senderUser = await User.findOne({_id:sender});
  const receiverUser = await User.findOne({_id:receiver});
  const msg = `Your booking cancelled by ${(senderUser.gender != 'Female') ? 'Mr.' : 'Miss.'} ${senderUser.firstName || ''} ${senderUser.lastName || ''} for your ride ${ride.startLocation} to ${ride.endLocation} on ${Helper.dateFormatting(ride.tripDate)} ${Helper.timeFormatting(ride.tripTime)} due to ${message}.`;
  if(receiverUser.mobile.mobileNumber){
    Helper.sendWhatsappNotification(receiverUser.mobile.mobileNumber,'booking_cancelled',[
      `${(senderUser?.gender != 'Female') ? 'Mr.' : 'Miss.'} ${senderUser.firstName || ''} ${senderUser.lastName || ''}`,
      `${ride.startLocation} to ${ride.endLocation} on ${Helper.dateFormatting(ride.tripDate)} ${Helper.timeFormatting(ride.tripTime)}`,
      `${message}`
    ]);
    sendMsgMobile(receiverUser.mobile.mobileNumber,msg);
  }
  await notificationController.postNotification(
    sender,
    receiver,
    "cancleBookedRide",
    msg,
    "CancelBookedRide"
  );
  if (receiver) {
    var content = {
      title: "Booking Passenger Cancel",
      body:msg,
      image: "https://www.hardwoodskiandbike.ca/wp-content/uploads/2017/05/cancelled-700x300.jpg",
    };
    const key = await GetToken(receiver);
    if (key != "") {
      var firebaseres = await firebase.sendNotification(key, content);
    }
  }
  var messsage1 = `Your ride is Cancelled successfully from ${ride.startLocation} to ${ride.endLocation} on ${Helper.dateFormatting(ride.tripDate)} ${Helper.timeFormatting(ride.tripTime)}`
  await notificationController.postNotificationSelf(sender, "Self", messsage1,"CancelBookedRide");
    if (sender) {
      var content = {
        title: "Booking Cancel",
        body: messsage1,
        image: "https://www.hardwoodskiandbike.ca/wp-content/uploads/2017/05/cancelled-700x300.jpg",
      };
      const key = await GetToken(sender);

      if (key != "") {
        var firebaseres = await firebase.sendNotification(key, content);
      }
    }

  res.status(200).json({
    status: true,
    data: {
      message: "User Cancle Booked Ride Successfully",
      updateRide,
    },
  });
});

// get booked ride

exports.getBookedRide = catchAsync(async (req, res, next) => {
  var { userId } = req.body;
  if (!userId) return next(new AppErr("Pelase Provide userId"), 200);
  userId = new ObjectId(userId);
  const rideBookedRide = await BookedRide.aggregate([
                          {$lookup:
                            {
                              from:'ratings',
                              localField:'ride',
                              foreignField:'rideId',
                              as:'rating'
                            }
                          },
                          {$lookup:
                            {
                              from:'rides',
                              localField:'ride',
                              foreignField:'_id',
                              as:'ride'
                            }
                          },
                          {
                             $addFields: {
                                 convertedUserId: {
                                     $map: {
                                         input: "$ride",
                                         as: "r",
                                         in: "$$r.userId" 
                                     }
                                 }
                             },
                          },
                          {$lookup:
                            {
                              from:'users',
                              localField:'convertedUserId',
                              foreignField:'_id',
                              as:'userData'
                            }
                          },
                          {$match:{ user: userId }},
                          {$sort:{createdOn:-1}}
                        ]);
    var final_ride = [];
    rideBookedRide.map((ride)=>{
    delete ride.convertedUserId;
    r = {
      ...ride,
      ride:ride.ride[0],
      userData:{
        name:`${ride.userData[0].firstName} ${ride.userData[0].lastName}`,
        email:ride.userData[0].email.emailId,
        mobile:ride.userData[0].mobile.mobileNumber,
        profilePicture:ride.userData[0].profilePicture,
      }
    }
    tDate = ride.ride[0].tripDate;
    tTime =ride.ride[0].tripTime;
    date = new Date(tDate).getDate();
    month = new Date(tDate).getMonth()+1;
    year = new Date(tDate).getFullYear();
    hour = new Date(tTime).getHours();
    minutes = new Date(tTime).getMinutes();
    seconds = new Date(tTime).getSeconds();
    var totalTIme = Helper.getDayWithCalculate(ride?.ride[0]?.totalTime);
    var chkDate = new Date(year+'/'+month+'/'+date+' '+hour+':'+minutes+':'+seconds);
    chkDate.setDate(chkDate.getDate()+(Number(totalTIme.day)+7));
    chkDate.setHours(chkDate.getHours()+Number(totalTIme.hour));
    chkDate.setMinutes(chkDate.getMinutes()+Number(totalTIme.minutes));
    if((new Date(year+'/'+month+'/'+date+' '+hour+':'+minutes+':'+seconds) <= new Date()) && (new Date(chkDate) >= new Date())) {
      r.tripStatus = true;
      ride.rating.map((rat)=>{
        if((rat.userId.toString()== userId.toString())){
          r.tripStatus = false;
        }
      });
    }else{
      r.tripStatus = false;
    }
    final_ride.push(r);
  });
    
  res.status(200).json({
    status: true,
    message: "Get ride detail Successfully By User Id",
    rideBookedRide:final_ride,
  });
});
// delete booked ride
exports.deleteRide = catchAsync(async (req, res, next) => {
  const { id } = req.body;
  if (!id) return next(new AppErr("Pelase Provide Ride Id"), 200);

  const rideDelete = await BookedRide.findByIdAndDelete({ _id: id });
  res.status(200).json({
    status: true,
    message: "Delete Ride Successfully By Ride Id",
    rideDelete,
  });
});

// already booked passenger
exports.getAlreadyBookedPassenger = catchAsync(async (req, res, next) => {
  const { rideId } = req.body;
  if (!rideId) return next(new AppErr("Pelase Provide userId"), 200);

  const bookedPassenger = await BookedRide.find({ $and: [{ ride: rideId }, { status: "Booked" }] })
    .select("-__v")
    .populate({
      path: "user",
      select: "-email -mobile -createdOn -bio -DOB -ride -__v",
      model: "User",
    })
    .populate({
      path: "ride",
      select: "-__v",
      model: "Ride",
    });
  if(bookedPassenger.length > 0){
    res.status(200).json({
      status: true,
      message: "Get Booked Passenger detail Successfully By rideId",
      bookedPassenger,
    });
  }else{
    res.status(200).json({
      status: false,
      message: "No Record Found",
    });
  }
});
exports.createRideView = catchAsync(async (req, res, next) => {
  try {
    const { userId, rideId } = req.body;
    if (!userId) {
      return res.status(200).json({
        message: "User Id Not found",
        success: false,
      });
    } else if (!rideId) {
      return res.status(200).json({
        message: "Ride Id not found",
        success: false,
      });
    } else if (await RideView.findOne({ $and: [{ userId: userId }, { rideId: rideId }] })) {
      return res.status(200).json({
        message: "Ride View Already Created",
        success: false,
      });
    } else {
      const rideView = await RideView.create({ userId: userId, rideId: rideId });
      return res.status(200).json({
        message: "Ride View Created Successfully",
        success: true,
        data: rideView,
      });
    }
  } catch (error) {
    return res.status(200).json({
      message: "Something went wrong",
      success: false,
    });
  }
});
exports.getRideViewByRideId = catchAsync(async (req, res, next) => {
  try {
    const { rideId } = req.body;
    if (!rideId) {
      return res.status(200).json({
        message: "Ride Id not found",
        success: false,
      });
    } else {
      const rideView = await RideView.find({ rideId: rideId }).select("-__v");
      return res.status(200).json({
        message: "Data Get Successfully",
        success: true,
        viewcount: rideView.length,
      });
    }
  } catch (error) {
    return res.status(200).json({
      message: "Something went wrong",
      success: false,
    });
  }
});

exports.waitingbookedRide = async (req,res,next) => {
  try {
    var { rideId } = req.body;
    var expireTime = Helper.bookingExpireTime();
    var ride = await Ride.findOne({_id:rideId}).sort({createdOn:-1}).exec();
    BookedRide.aggregate([
      { $lookup: 
        {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user'
        }
      },
      {$match:{ride:ride._id,status:'Waiting'}}
    ],
    (err, bookedrides) =>{
      var data = [];
      bookedrides.map((bookedride)=>{
        date = new Date(bookedride.createdOn)
        date.setHours(date.getHours() + expireTime);
        if(date > new Date()){
          d = {...ride._doc,
            user:{
              name:`${bookedride.user[0].firstName} ${bookedride.user[0].lastName}`,
              email:bookedride.user[0].email.emailId,
              DOB:bookedride.user[0].DOB,
              profilePicture:bookedride.user[0].profilePicture,
              mobile:bookedride.user[0].mobile.mobileNumber,
              _id:bookedride.user[0]._id,  
            },
            bookedride:{
              receiver:bookedride.receiver,
              ride:bookedride.ride,
              status:bookedride.status,
              pasangerCount:bookedride.pasangerCount,
              createdOn:bookedride.createdOn,
              expiredOn:date,
              _id:bookedride._id,
            }
          };
          data.push(d);
        }
      });
      if(data.length > 0){
        return res.status(200).json({
          message: "Get Waiting Passenger detail Successfully By rideId",
          success: true,
          data: data,
        });
      }else{
        return res.status(200).json({
          message: "No Record Found",
          success: false,
          data: {},
        });
      }
      
    });
  } catch (error) {
    next(error);
  }
}

exports.approveOrRejectBookedRide = async (req,res,next) => {
  try {
    const { booked_ride_id, type, message } = req.body;
    const bookedride = await BookedRide.findOne({ _id: booked_ride_id });
    const ride = await Ride.findOne({_id:bookedride.ride});
    const userData = await User.findOne({_id:bookedride.receiver});
    const receiverData = await User.findOne({_id:bookedride.userId});
    if(type == 'Accept'){
      const update = await BookedRide.findByIdAndUpdate(
        { _id: booked_ride_id },
        { status: 'Booked',message:message },
        { runValidator: true, useFindAndModify: false, new: true }
      );
      const message1 = `Your booking successfully approved by ${(userData?.gender != 'Female') ? 'Mr.' : 'Miss.'} ${userData.firstName || ''} ${userData.lastName || ''} for your ride ${ride.startLocation} to ${ride.endLocation} on ${Helper.dateFormatting(ride.tripDate)} ${Helper.timeFormatting(ride.tripTime)} contact to ${userData.firstName || ''} ${userData.lastName || ''} for more details...`;
      if(receiverData?.mobile?.mobileNumber){
        Helper.sendWhatsappNotification(receiverData.mobile.mobileNumber,'booking_approved',[
          `${(userData?.gender != 'Female') ? 'Mr.' : 'Miss.'} ${userData.firstName || ''} ${userData.lastName || ''}`,
          `${ride.startLocation} to ${ride.endLocation} on ${Helper.dateFormatting(ride.tripDate)} ${Helper.timeFormatting(ride.tripTime)}`,
          `${(userData?.gender != 'Female') ? 'Mr.' : 'Miss.'} ${userData.firstName || ''} ${userData.lastName || ''}`
        ]);
        sendMsgMobile(receiverData?.mobile?.mobileNumber,message1);
      }
      await notificationController.postNotification(
        bookedride.receiver,
        bookedride.user,
        "Booking Approval",
        message1,
        "BookingApproval",
      );

      if (bookedride.user) {
        var content = {
          title: "Booking Approval",
          body: message1,
          image: "https://blog.uber-cdn.com/cdn-cgi/image/width=2160,quality=80,onerror=redirect,format=auto/wp-content/uploads/2019/01/UBERIM_Rider_5.1_UAE_17_0272-RT_airport.jpg",
        };
        const key = await GetToken(bookedride.user);
        if (key != "") {
          var firebaseres = await firebase.sendNotification(key, content);
        }
      }
      res.status(200).json({
        status: true,
        message: "Booked Ride Accepted Succussefully",
        data: {},
      });
    }else{
      const update = await BookedRide.findByIdAndUpdate(
        { _id: booked_ride_id },
        { status: 'Rejected',message:message },
        { runValidator: true, useFindAndModify: false, new: true }
      );
      const ride = await Ride.findOne({ _id: bookedride.ride });
      const updateCount = await Ride.findByIdAndUpdate(
        { _id: bookedride.ride },
        { totalSeatCount: (parseInt(ride.totalSeatCount)+parseInt(bookedride.pasangerCount)) }
      );
      const message1 = `Your booking rejected by ${(userData?.gender != 'Female') ? 'Mr.' : 'Miss.'} ${userData?.firstName || '' } ${userData?.lastName || '' } for your ride ${ride.startLocation} to ${ride.endLocation} on ${Helper.dateFormatting(ride.tripDate)}  ${Helper.timeFormatting(ride.tripTime)} due to ${message}.`;
      if(receiverData?.mobile?.mobileNumber){
        Helper.sendWhatsappNotification(receiverData.mobile.mobileNumber,'booking_rejected',[
          `${(userData?.gender != 'Female') ? 'Mr.' : 'Miss.'} ${userData.firstName || ''} ${userData.lastName || ''}`,
          `${ride.startLocation} to ${ride.endLocation} on ${Helper.dateFormatting(ride.tripDate)} ${Helper.timeFormatting(ride.tripTime)}`,
          `${message}`
        ]);
        sendMsgMobile(receiverData?.mobile?.mobileNumber,message1);
      }
      await notificationController.postNotification(
        bookedride.receiver,
        bookedride.user,
        "Booking Approval",
        message1,
        "BookingApproval",
      );

      if (bookedride.user) {
        var content = {
          title: "Booking Rejected",
          body: message1,
          image: "https://www.hardwoodskiandbike.ca/wp-content/uploads/2017/05/cancelled-700x300.jpg",
        };
        const key = await GetToken(bookedride.user);
        if (key != "") {
          var firebaseres = await firebase.sendNotification(key, content);
        }
      }
      res.status(200).json({
        status: true,
        message: "Booked Ride Rejected Succussefully",
        data: {},
      });
    }
  } catch (error) {
    next(error);
  }
}

exports.getbookedrideStatus = async (req,res,next) =>{
  try{
    const {userId,bookedrideId} = req.body;
    const bookedRideData = await BookedRide.findOne({_id:bookedrideId,user:userId});
    if(bookedRideData == null){
      res.status(200).json({
        status:false,
        message:"No Ride Found!!",
        data:{}
      });
    } else {
      res.status(200).json({
        status:true,
        message:"Status Found Successfully!!",
        data:{
          BookedRideStatus:bookedRideData.status
        }
      });
    }
  }catch (error){
    next(error);
  }
}