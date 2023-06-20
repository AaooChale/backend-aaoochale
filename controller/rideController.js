const path = require("path");
const catchAsync = require(path.join(__dirname, "..", "utils", "catchAsync"));
const AppErr = require(path.join(__dirname, "..", "utils", "AppErr"));
const Ride = require("../model/rideModel");
const BookedRide = require("../model/rideBookingModel");
const Rating = require("../model/ratingModel");
const cancleRide = require("../model/rideCancleModel");
const RideAlert = require("../model/rideAlertModal");
const notificationController = require("../notification/notificationController");
const Token = require("../model/fireBaseSchema");
const Helper = require("../config/Helper");
const firebase = require("../notification/firebase");
const User = require(path.join(__dirname, "..", "model", "userModel"));
const { sendMsgMobile } = require(path.join(__dirname, "..", "helpers", "generateOtp"));

exports.createRide = catchAsync(async (req, res, next) => {
  const {
    pickUpLocation,
    pickupLat,
    pickLong,
    dropLocation,
    dropLat,
    dropLong,
    stopCity,
    tripDate,
    tripTime,
    totalDistance,
    totalTime,
    backSeatEmpty,
    passengerCount,
    rideApproval,
    tripPrise,
    extraMessage,
    select_route,
    rideStatus,
    startLocation,
    endLocation,
    vehicleSelect,
    userId,
    arrivalTime,
    destinationTime,
  } = req.body;
  const resisterRide = await Ride.create({
    pickUpLocation: pickUpLocation,
    pickupLat: pickupLat,
    pickLong: pickLong,
    dropLocation: dropLocation,
    dropLat: dropLat,
    dropLong: dropLong,
    stopCity: stopCity,
    tripDate: tripDate,
    tripTime: tripTime,
    totalDistance: totalDistance,
    totalTime: totalTime,
    backSeatEmpty: backSeatEmpty,
    passengerCount: passengerCount,
    totalSeatCount: passengerCount,
    rideApproval: rideApproval,
    tripPrise: tripPrise,
    extraMessage: extraMessage,
    select_route: select_route,
    startLocation: startLocation,
    endLocation: endLocation,
    rideStatus: rideStatus,
    vehicleSelect: vehicleSelect,
    userId: userId,
    arrivalTime: arrivalTime,
    destinationTime: destinationTime,
    createdOn: (new Date()).getTime() + 5.5 * 60 * 60 * 1000,
  });
var dd = new Date(tripDate);
  const rideAlert = await RideAlert.find({
    date:{
      $gte:dd,
      $lte:dd
  }}); 
  rideAlert.map(async (alert)=>{
    startPointDistance = Helper.distanceCount(resisterRide.pickupLat,resisterRide.pickLong,alert.startLat,alert.startLong);
    endPointDistance = Helper.distanceCount(resisterRide.dropLat,resisterRide.dropLong,alert.endLat,alert.endLong);
    if(startPointDistance <= 50 && endPointDistance <=50){
      userData = await User.findOne({_id:alert.userId}); 
      const message = `Your ride available for your route ${startLocation} to ${endLocation} on ${Helper.dateFormatting(tripDate)} ${Helper.timeFormatting(tripTime)}. Click here to book now`;
      const messageMobile = `Your ride available for your route ${startLocation} to ${endLocation} on ${Helper.dateFormatting(tripDate)} ${Helper.timeFormatting(tripTime)}. book now`;
      if(userData.mobile.mobileNumber){
        sendMsgMobile(userData.mobile.mobileNumber,messageMobile);
      }

    await notificationController.postNotificationSelf(alert.userId, "Self", message,"RideAlert");
    if (alert.userId) {
        var content = {
          title: "Ride Alert",
          body: message,
          image: "https://www.bft.org/assets/1/13/rider_alert2.jpg",
          click_action:"SOMEACTION",
        };
        const key = await GetToken(alert.userId);

        if (key != "") {
          var firebaseres = await firebase.sendNotification(key, content);
        }
      }
    }
  });
  res.status(200).json({
    status: true,
    data: {
      message: "Create Ride Successfully",
      resisterRide,
    },
  });
});

exports.getRide = catchAsync(async (req, res, next) => {
  const { id } = req.body;
  if (!id) return next(new AppErr("Pelase Provide Ride Id"), 200);
  const ride = await Ride.findById({ _id: id });
  res.status(200).json({
    status: true,
    data: {
      message: "Get Ride Successfully",
      ride,
    },
  });
});

exports.getRideByUserId = async (req, res, next) => {
  const { id } = req.body;
  if (!id)
    ({
      status: false,
      data: {
        message: "Please Provide userId",
      },
    });

  const rides = await Ride.find({ userId: id }).sort({createdOn:-1});
  var ride_ids = [];
  rides.map((ride)=>{
    if(ride.rideApproval == 'Yes'){
      ride_ids.push(ride._id);
    }
  });
  const bookedride = await BookedRide.find({ride:{$in:ride_ids},status:'Waiting'}).exec();
  const ratingData = await Rating.find({rideId:{$in:ride_ids},userId:id});
  var final_ride = rides.map((ride)=>{
    r = {};
    if(ride.rideApproval == 'Yes'){
      var status = false;
      bookedride.map((booked_ride)=>{
        if(ride._id.toString() == booked_ride.ride.toString()){
          status = true;
        }
      });
      r= {...ride._doc,bookingStatus:status};
    }else{
      r= {...ride._doc,bookingStatus:false};
    }
    tDate = ride.tripDate;
    tTime = ride.tripTime;
    date = new Date(tDate).getDate();
    month = new Date(tDate).getMonth()+1;
    year = new Date(tDate).getFullYear();
    hour = new Date(tTime).getHours();
    minutes = new Date(tTime).getMinutes();
    seconds = new Date(tTime).getSeconds();
    var totalTIme = Helper.getDayWithCalculate(ride?.totalTime);
    var chkDate = new Date(year+'/'+month+'/'+date+' '+hour+':'+minutes+':'+seconds);
    chkDate.setDate(chkDate.getDate()+(Number(totalTIme.day)+7));
    chkDate.setHours(chkDate.getHours()+Number(totalTIme.hour));
    chkDate.setMinutes(chkDate.getMinutes()+Number(totalTIme.minutes));
    if((new Date(year+'/'+month+'/'+date+' '+hour+':'+minutes+':'+seconds) <= new Date()) && (new Date(chkDate) >= new Date())) {
      r.tripStatus = true;
      ratingData.map((rat)=>{
        if(rat?.rideId?.toSting()== rideId._id.toSting()){
          r.tripStatus = false;
        }
      });
    }else{
      r.tripStatus = false;
    }
    return r;
  });
  res.status(200).json({
    status: true,
    data: {
      message: "Get Ride Successfully By user Id",
      final_ride,
    },
  });
};

// TOTAL DISTANCE COUNT FUNCTION
// function Helper.distanceCount(latitude1, longitude1, latitude2, longitude2, units) {
//   var p = 0.017453292519943295; //This is  Math.PI / 180
//   var c = Math.cos;
//   var a =
//     0.5 -
//     c((latitude2 - latitude1) * p) / 2 +
//     (c(latitude1 * p) * c(latitude2 * p) * (1 - c((longitude2 - longitude1) * p))) / 2;
//   var R = 6371; //  Earth distance in km so it will return the distance in km
//   var dist = 2 * R * Math.asin(Math.sqrt(a));
//   return dist;
// }
// DISTANCE COUNT API
exports.countDistance = catchAsync(async (req, res, next) => {
  const { id } = req.body;
  if (!id) return next(new AppErr("Pelase Provide Ride Id"), 200);
  const data = await Ride.findOne({ _id: id });
  const distance = Helper.distanceCount(data.pickupLat, data.pickLong, data.dropLat, data.dropLong);
  res.status(200).json({
    status: true,
    data: {
      message: "Count Distance In Km",
      distance,
    },
  });
});
exports.deleteRide = catchAsync(async (req, res, next) => {
  const { id } = req.body;
  if (!id) return next(new AppErr("Pelase Provide Ride Id"), 200);
  const deleteRide = await Ride.findByIdAndDelete({ _id: id });
  res.status(200).json({
    status: true,
    message: "Delete Ride Successfully By Ride Id",
    deleteRide,
  });
});
exports.updateRideDetails = catchAsync(async (req, res, next) => {
  const {
    id,
    pickUpLocation,
    pickupLat,
    pickLong,
    dropLocation,
    dropLat,
    dropLong,
    stopCity,
    stopCityLat,
    stopCityLong,
    tripDate,
    tripTime,
    totalDistance,
    totalTime,
    backSeatEmpty,
    passengerCount,
    rideApproval,
    tripPrise,
    extraMessage,
    select_route,
    rideStatus,
    arrivalTime,
    destinationTime,
  } = req.body;
  if (!id) return next(new AppErr("Pelase Provide User Id"), 200);
  const user = await Ride.findByIdAndUpdate(
    { _id: id },
    { ...req.body },
    { runValidator: true, useFindAndModify: false, new: true }
  );
  await user.save();
  res.status(200).json({  
    status: true,
    data: {
      message: "Update Ride details Successfully",
      user,
    },
  });
});

// change satus
exports.changeRideStatus = catchAsync(async (req, res, next) => {
  const { id, rideStatus } = req.body;
  if (!id || !rideStatus) return next(new AppErr("Pelase Provide User Id"), 200);
  const changeRideStatus = await Ride.findByIdAndUpdate(
    { _id: id },
    { rideStatus: rideStatus },
    { runValidator: true, useFindAndModify: false, new: true }
  );
  await changeRideStatus.save();
  res.status(200).json({
    status: true,
    data: {
      message: "change rideStatus  Successfully",
      changeRideStatus,
    },
  });
});


const GetToken = async (userId) => {
  const list = await Token.find({ user_id: userId });

  if (list.length > 0) {
    return list[0].token;
  } else {
    var token = "";
    return token;
  }
};


exports.cancleRide = catchAsync(async (req, res, next) => {
  const { id, rideStatus, userId, massage } = req.body;
  if (!id || !rideStatus) return next(new AppErr("Pelase Provide User Id"), 200);
  const CancleRide = await Ride.findByIdAndUpdate(
    { _id: id },
    { rideStatus: rideStatus },
    { runValidator: true, useFindAndModify: false, new: true }
  );
  await CancleRide.save();
  const CancleBookedRide = await BookedRide.findOneAndUpdate(
    { ride: id },
    { rideStatus: rideStatus },
    { runValidator: true, useFindAndModify: false, new: true }
  );
  await CancleRide.save();
  const cancleRideNew = await cancleRide.create({
    userId: userId,
    rideid: id,
    massage: massage,
    rideStatus: rideStatus,
  });
  var message1 = `Your ride is Cancelled successfully from ${CancleRide.startLocation} to ${CancleRide.endLocation} on ${Helper.dateFormatting(CancleRide.tripDate)} ${Helper.timeFormatting(CancleRide.tripTime)}`
  await notificationController.postNotificationSelf(userId, "Self", message1,"CancelRide");
    //
    if (userId) {
      var content = {
        title: "Ride Cancelled",
        body: message1,
        image: "https://www.hardwoodskiandbike.ca/wp-content/uploads/2017/05/cancelled-700x300.jpg",
      };
      const key = await GetToken(userId);

      if (key != "") {
        var firebaseres = await firebase.sendNotification(key, content);
      }
    }
    const bookedRIde = await BookedRide.find({ride:id});
    const userData = await User.findOne({_id:userId});
    const msg = `${(userData?.gender != 'Female') ? 'Mr.' : 'Miss.'} ${userData.firstName || ''} ${userData.lastName || ''} cancelled a ride from ${CancleRide.startLocation} to ${CancleRide.endLocation} on ${Helper.dateFormatting(CancleRide.tripDate)} ${Helper.timeFormatting(CancleRide.tripTime)} due to ${massage}.`;
    
    bookedRIde.map(async (bookedride)=>{
      if(bookedride.status == 'Booked'){
        recieverData = await User.findOne({_id:bookedride.user})
        if(recieverData.mobile.mobileNumber){
          Helper.sendWhatsappNotification(recieverData.mobile.mobileNumber,'cancelled_ride_',[
            `${(userData?.gender != 'Female') ? 'Mr.' : 'Miss.'} ${userData.firstName || ''} ${userData.lastName || ''}`,
            `${CancleRide.startLocation} to ${CancleRide.endLocation} on ${Helper.dateFormatting(CancleRide.tripDate)} ${Helper.timeFormatting(CancleRide.tripTime)}`,
            `${massage}`
          ]);
          sendMsgMobile(recieverData.mobile.mobileNumber,msg);
        }
        await notificationController.postNotification(userId, bookedride.user, "CancelRide", msg,"CancelRide");
        ///////// firebase

        if (bookedride.user) {
          var content = {
            title: "Ride Cancelled",
            body: msg,
            image: "https://www.hardwoodskiandbike.ca/wp-content/uploads/2017/05/cancelled-700x300.jpg",
          };
          const key = await GetToken(bookedride.user);

          if (key != "") {
            var firebaseres = await firebase.sendNotification(key, content);
          }
        }
      }
    });
  res.status(200).json({
    status: true,
    data: {
      message: "Cancle Ride Successfully",
      CancleRide,
    },
  });
});


const newrating = (getRating,userId) =>{
  if (userId) {
    const sum = [];
    getRating.map((item) => {
      if(item.driverId.toString() == userId._id.toString()){
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

exports.searchJobs = async (req, res, next) => {
  try {
    let { pickupLat, pickLong, dropLat, dropLong, userId, tripDate, passengerCount, rideId } = req.body;
    const queryId = userId;
    const customDate = tripDate.toString().split("T")[0] + "T00:00:00.000+00:00";
    const result = await Ride.find({
      userId: { $ne: queryId },
      tripDate: { $eq: new Date(customDate) },
      passengerCount: { $gte: passengerCount },
    })
    .select(
      "tripDate passengerCount totalSeatCount totalDistance pickUpLocation pickupLat pickLong dropLocation dropLat dropLong tripTime tripPrise startLocation endLocation arrivalTime destinationTime totalTime backSeatEmpty rideApproval"
    )
    .populate({
      path: "userId",
      select: "firstName lastName profilePicture chattiness music smoking pets startRating userStatus ",
      model: "User",
    });
    const R = 6371;
    let array = [];
    let status = false;
    let msg = " ";
    var r_data = [];
    result.map((r)=>{
      r_data.push(r.userId._id);
    });
    var rat = await Rating.find({ driverId:{$in:r_data} });
    result.map((item, index) => {
      distanc = Helper.distanceCount(item.pickupLat, item.pickLong, pickupLat, pickLong);
      distanc1 = Helper.distanceCount(item.dropLat, item.dropLong, dropLat, dropLong);
      console.log(item.dropLat, item.dropLong, dropLat, dropLong);
      const pickupCityradius = Helper.cityRadius(item.pickupLat,item.pickLong);
      const dropCityradius = Helper.cityRadius(item.dropLat,item.dropLong);
      if (distanc <= pickupCityradius && distanc1 <= dropCityradius) {
        let rating = newrating(rat,item.userId);
        bookedSeat = parseInt(item.passengerCount) - parseInt(item.totalSeatCount);
        item = {...item._doc,rating:rating,bookedSeat:bookedSeat};
        array.push(item);
      }
    });
    res.status(200).send({
      success: (array.length > 0) ? true : false,
      msg: (array.length > 0) ? "Search Result Found Successfully!" : "No Any Search Result Found!",
      Search_Data: array,
    });
  } catch (error) {
    next(error);
  }
};
exports.createRideAlert = catchAsync(async (req, res, next) => {
  try {
    const { userId, startLocation, endLocation, startLat, startLong, endLat, endLong, date, peopleCount } = req.body;
    if (!userId || !userId.trim() ) 
    {
      return res.status(200).json({
        message: "User Id not found",
        success: false,
      });
    } else if (!startLocation || !startLocation.trim()) {
      return res.status(200).json({
        message: "Pick up address not found",
        success: false,
      });
    } else if (!endLocation || !endLocation.trim()) {
      return res.status(200).json({
        message: "Dropoff address not found",
        success: false,
      });
    } else if (!startLat || !startLat.trim()) {
      return res.status(200).json({
        message: "Pick up latitude not found",
        success: false,
      });
    } else if (!startLong || !startLong.trim()) {
      return res.status(200).json({
        message: "Pick up longitude not found",
        success: false,
      });
    } else if (!endLat || !endLat.trim()) {
      return res.status(200).json({
        message: "Dropoff latitude not found",
        success: false,
      });
    } else if (!endLong || !endLong.trim()) {
      return res.status(200).json({
        message: "Dropoff longitude not found",
        success: false,
      });
    } else if (!date || !date.trim()) {
      return res.status(200).json({
        message: "date not found",
        success: false,
      });
    } else if (!peopleCount || !peopleCount.trim()) {
      return res.status(200).json({
        message: "People count not found",
        success: false,
      });
    } else {
      const Ridealert = await RideAlert.create({ userId, startLocation, endLocation, startLat, startLong, endLat, endLong, date, peopleCount });
      return res.status(200).json({
        message: "Ride alert created successfully",
        success: true,
        data: Ridealert,
      });
    }
  } catch (error) {
    return res.status(200).json({
      message: "Something went wrong",
      success: false,
    });
  }
}); 

exports.copyRide = async (req,res,next) =>{
  try{
    var {userId,rideId,tripDate,tripTime,tripPrise} = req.body;
    var ride = await Ride.findOne({_id:rideId});
    
    if(ride == null){
      return res.status(200).json({
        message: "No Ride data Found",
        success: false,
      });
    }
    const resisterRide = await Ride.create({
      pickUpLocation: ride.pickUpLocation,
      pickupLat: ride.pickupLat,
      pickLong: ride.pickLong,
      dropLocation: ride.dropLocation,
      dropLat: ride.dropLat,
      dropLong: ride.dropLong,
      stopCity: ride.stopCity,
      tripDate: tripDate,
      tripTime: tripTime,
      totalDistance: ride.totalDistance,
      totalTime: ride.totalTime,
      backSeatEmpty: ride.backSeatEmpty,
      passengerCount: ride.passengerCount,
      totalSeatCount: ride.passengerCount,
      rideApproval: ride.rideApproval,
      tripPrise: tripPrise,
      extraMessage: ride.extraMessage,
      select_route: ride.select_route,
      startLocation: ride.startLocation,
      endLocation: ride.endLocation,
      rideStatus: ride.rideStatus,
      vehicleSelect: ride.vehicleSelect,
      userId: userId,
      arrivalTime: ride.arrivalTime,
      destinationTime: ride.destinationTime,
      createdOn: (new Date()).getTime() + 5.5 * 60 * 60 * 1000,
    });
    var dd = new Date(tripDate);
    const rideAlert = await RideAlert.find({
      date:{
        $gte:dd,
        $lte:dd
    }}); 
    rideAlert.map(async (alert)=>{
      startPointDistance = Helper.distanceCount(resisterRide.pickupLat,resisterRide.pickLong,alert.startLat,alert.startLong);
      endPointDistance = Helper.distanceCount(resisterRide.dropLat,resisterRide.dropLong,alert.endLat,alert.endLong);
      if(startPointDistance <= 50 && endPointDistance <=50){
        const message = `Your ride available for your route ${ride.startLocation} to ${ride.endLocation} on ${Helper.dateFormatting(tripDate)} ${Helper.timeFormatting(tripTime)}. Click here to book now`;
        await notificationController.postNotificationSelf(alert.userId, "Self", message,"RideAlert");
      
        userData = await User.findOne({_id:alert.userId});
        const messageMobile = `Your ride available for your route ${startLocation} to ${endLocation} on ${Helper.dateFormatting(tripDate)} ${Helper.timeFormatting(tripTime)}. book now`;
        if(userData.mobile.mobileNumber){
          sendMsgMobile(userData.mobile.mobileNumber,messageMobile);
        }
        if (alert.userId) {
          var content = {
            title: "Ride Alert",
            body: message,
            image: "https://www.bft.org/assets/1/13/rider_alert2.jpg",
            click_action:"SOMEACTION",
          };
          const key = await GetToken(alert.userId);

          if (key != "") {
            var firebaseres = await firebase.sendNotification(key, content);
          }
        }
      }
    });
    res.status(200).json({
      status: true,
      data: {
        message: "Create Ride Successfully",
        resisterRide,
      },
    });
  } catch (error) {
    return res.status(200).json({
      message: "Something went wrong",
      success: false,
    });
  }
}

exports.deleteStopCity = async (req,res,next) => {
  try {
    const {rideId,stopCityId} = req.body;
    const ride = await Ride.findOne({_id:rideId});
    if(ride != null){
      var stopCity = ride.stopCity.filter((r,index)=>{
        return r._id.toString() != stopCityId;
      });
      const rideSave = await Ride.findByIdAndUpdate(
        { _id: rideId },
        { stopCity:stopCity },
        { runValidator: true, useFindAndModify: false, new: true }
      );
      await rideSave.save();
      res.status(200).json({
        status: true,
        message:"Stop City has been Deleted Successfully!!",
        data: {},
      });
    }else{
      res.status(200).json({
        status: false,
        message:"No Ride data Found!!",
        data: {},
      });
    }
  } catch (error) {
    next(error);
  }
}

exports.updateStopCity = async (req,res,next) => {
  try {
    const {rideId,stopCityId,distance,duration,price,stop_address,stop_lat,stop_lng} = req.body;
    const ride = await Ride.findOne({_id:rideId});
    if(ride != null){
      var stopCity = ride.stopCity.map((r,index)=>{
        if(r._id.toString() == stopCityId){
          r = {...r._doc}
          if(distance){
            r = {...r,distance:distance}
          }
          if(duration){
            r = {...r,duration:duration}
          }
          if(price){
            r = {...r,price:price}
          }
          if(stop_address){
            r = {...r,stop_address:stop_address}
          }
          if(stop_lat){
            r = {...r,stop_lat:stop_lat}
          }
          if(stop_lng){
            r = {...r,stop_lng:stop_lng}
          }
        }
        return r;
      });
      const rideSave = await Ride.findByIdAndUpdate(
        { _id: rideId },
        { stopCity:stopCity },
        { runValidator: true, useFindAndModify: false, new: true }
      );
      await rideSave.save();
      res.status(200).json({
        status: true,
        message:"Stop City has been Updated Successfully!!",
        data: {},
      });
    }else{
      res.status(200).json({
        status: false,
        message:"No Ride data Found!!",
        data: {},
      });
    }
  } catch (error) {
    next(error);
  }
}

exports.addStopCity = async (req,res,next) => {
  try {
    const {rideId,distance,duration,price,stop_address,stop_lat,stop_lng} = req.body;
    const ride = await Ride.findOne({_id:rideId});
    if(ride != null){
      var stopCity = ride.stopCity;
      stopCity.push({
        distance:distance,
        duration:duration,
        price:price,
        stop_address:stop_address,
        stop_lat:stop_lat,
        stop_lng:stop_lng
      });
      const rideSave = await Ride.findByIdAndUpdate(
        { _id: rideId },
        { stopCity:stopCity },
        { runValidator: true, useFindAndModify: false, new: true }
      );
      await rideSave.save();
      res.status(200).json({
        status: true,
        message:"Stop City has been Added Successfully!!",
        data: {},
      });
    }else{
      res.status(200).json({
        status: false,
        message:"No Ride data Found!!",
        data: {},
      });
    }
  } catch (error) {
    next(error);
  }
}


