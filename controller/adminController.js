  const path = require("path");
  const catchAsync = require(path.join(__dirname, "..", "utils", "catchAsync"));
  const User = require("../model/userModel");
  const Ride = require("../model/rideModel");
  const BookedRide = require("../model/rideBookingModel");
  const Vehicle = require("../model/vehicleModel");
  const Rating = require("../model/ratingModel");
  const Report = require("../model/reportModel");
  const Broadcast = require("../model/Broadcast");
  const Helper = require("../config/Helper");
  const notificationController = require("../notification/notificationController");
  const BusinessSetting = require('../model/BusinessSetting');
  const Token = require("../model/fireBaseSchema");
  const firebase = require("../notification/firebase");
  require("dotenv").config();


  const GetToken = async (userId) => {
    const list = await Token.find({ user_id: userId });

    if (list.length > 0) {
      return list[0].token;
    } else {
      var token = "";
      return token;
    }
  };


  exports.getAllUsers = async (req, res, next) => {
    try {
      const users = await User.aggregate([
        {$lookup:
          {
            from:"bookedrides",
            localField:"_id",
            foreignField:"user",
            as:"ridebooked"
          }
        },
        {$lookup:
          {
            from:"rides",
            localField:"_id",
            foreignField:"userId",
            as:"rides"
          }
        },
        {$lookup:
          {
            from:"vehicles",
            localField:"_id",
            foreignField:"userId",
            as:"no_of_vehicles"
          }
        },
        {$sort:{createdOn:-1}}
      ]);
      const final_user =  users.map((user)=>{
        u= {
          ...user,
          doj:user.createdOn,
          totalrideBooked:user.ridebooked.length,
          totalrideShared:user.rides.length,
          noOfVehicles:user.no_of_vehicles.length
        }
        delete u.ridebooked;
        delete u.rides;
        delete u.no_of_vehicles;
        return  u;
      });
      res.status(200).json({
        status: true,
        msg: "Get all users successfully",
        users:final_user,
      });
    } catch (err) {
      next(err);
    }
  };
  exports.adminLogin = catchAsync(async (req, res, next) => {
    try {
      var email = "aaoochale@gmail.com";
      var password = "Admin@123";
      if (req.body.email == email && req.body.password == password) {
        const token = await Helper.signToken(email);
        const cookieOptions = {
          expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
          httpOnly: true,
        };
        res.cookie("jwt", token, cookieOptions);
        res.status(200).json({
          status: true,
          msg: "Login successfully",
          token:token
        });
      } else {
        res.status(200).json({
          status: false,
          msg: "Login failed please try again",
        });
      }
    } catch (error) {
      next(error);
    }
  });
  exports.mangeUserStatus = catchAsync(async (req, res, next) => {
    try {
      const { id, status } = req.body;
      if (!id || !status) {
        res.status(200).json({
          status: false,
          msg: "Please provide id and status",
        });
      } else {
        const user = await User.findOne({ _id: id });
        if (user) {
          user.userStatus = status;
          await user.save();
          if(status == 'Verified'){
            var notificationType = 'ProfileVerification';
            var message = `Congratulations! your profile is verified by our team. Click here to book or share ride now.`;
          }else{
            var notificationType = 'ProfileRejection';
            var message = `Your profile verification rejected by our team due to reason. Click here to upload again.`;
          }
          await notificationController.postNotificationSelf(id, "Self", message,notificationType);
          if (id) {
            var content = {
              title: "Profile Verification",
              body: message,
              image: "https://www.bft.org/assets/1/13/rider_alert2.jpg",
              click_action:"SOMEACTION",
            };
            const key = await GetToken(id);

            if (key != "") {
              var firebaseres = await firebase.sendNotification(key, content);
            }
          }
          res.status(200).json({
            status: true,
            msg: "User status updated successfully",
          });
        } else {
          res.status(200).json({
            status: false,
            msg: "User not found",
          });
        }
      }
    } catch (error) {
      next(error);
    }
  });

  exports.UserAllDoc = catchAsync(async (req, res, next) => {
    try {
      const userDoc = await User.find({}).sort({createdOn:-1}).select("documents");
      const userDeatils = await User.find({}).sort({createdOn:-1}).select("firstName lastName email mobile userStatus profilePicture");
      const value = userDoc.map((item, index) => {
        return {
          id: item._id,
          firstName: userDeatils[index].firstName,
          lastName: userDeatils[index].lastName,
          email: userDeatils[index].email,
          mobile: userDeatils[index].mobile,
          status: userDeatils[index].userStatus,
          profilePicture: userDeatils[index].profilePicture,
          documents: item.documents,
        };
      });
      res.status(200).json({
        status: true,
        msg: "Get all users document successfully",
        value,
      });
    } catch (error) {
      next(error);
    }
  });
  exports.AllCreatedRides = catchAsync(async (req, res, next) => {
    try {
      const rides = await Ride.aggregate([
        {$lookup:
          {
            from:"users",
            localField:"userId",
            foreignField:"_id",
            as:"user"
          }
        },
        {$sort:{createdOn:-1}}
      ]);
      var final_ride = rides.map((ride)=>{
        r = {
              ...ride,
              name:`${ride?.user[0]?.firstName || ''} ${ride?.user[0]?.lastName || ''}`,
              profilePicture:ride?.user[0]?.profilePicture,
            }
        delete r.user;
        return r;
      });
      res.status(200).json({
        status: true,
        msg: "Get all rides successfully",
        ride:final_ride,
      });
    } catch (error) {
      next(error);
    }
  });
  exports.AllBookedRides = catchAsync(async (req, res, next) => {
    try {
      const rides = await BookedRide.aggregate([
        {$lookup:
          {
            from:"rides",
            localField:"ride",
            foreignField:"_id",
            as:"ride"
          }
        },
        {$lookup:
          {
            from:"users",
            localField:"user",
            foreignField:"_id",
            as:"user"
          }
        },
        {$sort:{createdOn:-1}}
      ]);
      const value = rides.map((ride) => {
        return {
          userId: ride.user[0]._id,
          recieverId: ride.receiver,
          image: ride.user[0].profilePicture,
          firstName: ride.user[0].firstName,
          lastName: ride.user[0].lastName,
          email: ride.user[0].email.emailId,
          mobile: ride.user[0].mobile.mobileNumber,
          status: ride.user[0].userStatus,
          rideId: ride.ride[0]._id,
          startaddress: ride.ride[0].startLocation,
          endaddress: ride.ride[0].endLocation,
          rideDate: ride.ride[0].tripDate,
          rideTime: ride.ride[0].tripTime,
          centerroute: ride.ride[0].select_route,
          passengerCount: ride.ride[0].passengerCount,
          totalTime: ride.ride[0].totalTime,
          totalDistance: ride.ride[0].totalDistance,
          tripPrise: ride.ride[0].tripPrise,
        };
      });
      res.status(200).json({
        status: true,
        msg: "Get all rides successfully",
        value,
      });
    } catch (error) {
      next(error);
    }
  });
  exports.AllRating = catchAsync(async (req, res, next) => {
    try {
      const ratings = await Rating.aggregate([
        {$lookup:
          {
            from:"users",
            localField:"userId",
            foreignField:"_id",
            as:"user"
          }
        },
        {$lookup:
          {
            from:"users",
            localField:"driverId",
            foreignField:"_id",
            as:"driver"
          }
        },
        {$lookup:
          {
            from:"rides",
            localField:"rideId",
            foreignField:"_id",
            as:"ride"
          }
        },
        {$sort:{createdOn:-1}}
      ]);
      var All_Data = ratings.map((rating)=>{
        value = {
          userId: rating.userId,
          givenName: rating?.user[0]?.firstName + " " + rating?.user[0]?.lastName,
          mobile: rating?.user[0]?.mobile?.mobileNumber,
          profile: rating?.user[0]?.profilePicture,
          rideId: rating?.ride[0]?._id,
          startaddress: rating?.ride[0]?.startLocation,
          endaddress: rating?.ride[0]?.endLocation,
          rideDate: rating?.ride[0]?.tripDate,
          rideTime: rating?.ride[0]?.tripTime,
          startRating: rating?.startRating,
          message: rating?.message,
          reciverID: rating?.driverId,
          driverName: rating?.driver[0]?.firstName + " " + rating?.driver[0]?.lastName,
          driverMobile: rating?.driver[0]?.mobile?.mobileNumber,
          driverProfile: rating?.driver[0]?.profilePicture,
        };
        return value;
      });
      res.status(200).json({
        status: true,
        msg: "Get all rating successfully",
        All_Data,
      });
    } catch (error) {
      next(error);
    }
  });
  exports.AllReport = catchAsync(async (req, res, next) => {
    try {
      const reports = await Report.aggregate([
        {$lookup:
          {
            from:"users",
            localField:"userId",
            foreignField:"_id",
            as:"user"
          }
        },
        {$lookup:
          {
            from:"users",
            localField:"reportUId",
            foreignField:"_id",
            as:"reporteduser"
          }
        },
        {$lookup:
          {
            from:"rides",
            localField:"rideId",
            foreignField:"_id",
            as:"ride"
          }
        },
        {$sort:{createdOn:-1}}
      ]);
      var All_Data = reports.map((report) =>{
        value = {
          userId: report.userId,
          givenName: report.user[0].firstName + " " + report.user[0].lastName,
          mobile: report.user[0].mobile.mobileNumber,
          profile: report.user[0].profilePicture,
          rideId: report?.ride[0]?._id,
          startaddress: report?.ride[0]?.startLocation,
          endaddress: report?.ride[0]?.endLocation,
          rideDate: report?.ride[0]?.tripDate,
          rideTime: report?.ride[0]?.tripTime,
          reportUId: report.reportUId,
          preDefindMessage: report.preDefindMessage,
          userMessage: report.userMessage,
          repotedname: report.reporteduser[0].firstName + " " + report.reporteduser[0].lastName,
          repotedmobile: report.reporteduser[0].mobile.mobileNumber,
          repotedprofile: report.reporteduser[0].profilePicture,
        };
        return value;
      });
      res.status(200).json({
        status: true,
        msg: "Get all report successfully",
        All_Data,
      });
    } catch (error) {
      next(error);
    }

  });
  exports.AllVehicle = catchAsync(async (req, res, next) => {
    try {
      const vehicle = await Vehicle.find({}).sort({createdOn:-1});
      res.status(200).json({
        status: true,
        msg: "Get all vehicle successfully",
        vehicle,
      });
    } catch (error) {
      next(error);
    }
  });

  exports.DashbaordReport = catchAsync(async (req, res, next) => {
    try {
      var datas = {
        totalturnover:0,
        activeUsers:0,
        totalBooking:0,
        latestride:[],
        cancleride:[],
        daywiseBooking:{
          labels: [],
          data: []
        },
        dailyrideshared:{
          labels: [],
          data: [],
        },
        userdaywise:{
          labels: [],
          data: [],
        },
      };
      const rides= await Ride.find({rideStatus:{$ne:'Cancel'}});
      datas.activeUsers = await User.find({adminUserStatus:false}).count();
      rides.map((ride)=>{
        datas.totalturnover += (ride.tripPrise*(ride.passengerCount-ride.totalSeatCount));
      });
      datas.totalBooking = await BookedRide.find({status:"Booked"}).count();
      var date = new Date();
      date.setDate(date.getDate() - 6);
      var bookedriddaywise= await BookedRide.aggregate([
        {
          $match: {
            createdOn: {
              $gte: date
            } 
          } 
        }, { 
          $group: {
            _id: { 
              "year":  { "$year": "$createdOn" },
              "month": { "$month": "$createdOn" },
              "day":   { "$dayOfMonth": "$createdOn" }
            },
            count:{$sum: 1}
          }
        },
        {$sort:{createdOn:1}}
      ]);

      var sharedridedaywise= await Ride.aggregate([
        {
          $match: {
            createdOn: {
              $gte: date
            } 
          } 
        }, { 
          $group: {
            _id: { 
              "year":  { "$year": "$createdOn" },
              "month": { "$month": "$createdOn" },
              "day":   { "$dayOfMonth": "$createdOn" }
            },
            count:{$sum: 1}
          }
        },
        {$sort:{createdOn:1}}
      ])


      var userdaywise= await User.aggregate([
        {
          $match: {
            createdOn: {
              $gte: date
            } 
          } 
        }, { 
          $group: {
            _id: { 
              "year":  { "$year": "$createdOn" },
              "month": { "$month": "$createdOn" },
              "day":   { "$dayOfMonth": "$createdOn" }
            },
            // _id:"$createdOn",
            count:{$sum: 1}
          }
        },
        {$sort:{createdOn:1}}
      ]);
      var days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      var daysFullName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thusday', 'Friday', 'Saturday'];
      
      var daysname = [];
      var reportdays = []
      bookedriddaywise.map((bookedriddaywis)=>{
        var arr=[];
        var d = new Date(`${bookedriddaywis._id.month}/${bookedriddaywis._id.day}/${bookedriddaywis._id.year}`);
        var dayName = days[d.getDay()];
        arr[dayName] = bookedriddaywis.count;
        reportdays.push(arr);
      });
      var reportdaysshared = [];
      sharedridedaywise.map((sharedridedaywis)=>{
        var arr=[];
        var d = new Date(`${sharedridedaywis._id.month}/${sharedridedaywis._id.day}/${sharedridedaywis._id.year}`);
        var dayName = days[d.getDay()];
        arr[dayName] = sharedridedaywis.count;
        reportdaysshared.push(arr);
      });
      var reportdaysuser = [];
      userdaywise.map((userdaywis)=>{
        var arr=[];
        var d = new Date(`${userdaywis._id.month}/${userdaywis._id.day}/${userdaywis._id.year}`);
        var dayName = days[d.getDay()];
        arr[dayName] = userdaywis.count;
        reportdaysuser.push(arr);
      });
      for(var i= 7; i>=1;i--){
        arr = [];
        count = 0;
        countshared = 0;
        countuser = 0;
        oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - i);
        daysname.push(days[oneWeekAgo.getDay()]);
        reportdays.map((r)=>{
          if(r[days[oneWeekAgo.getDay()]] != undefined){
            count = r[days[oneWeekAgo.getDay()]];
          }
        });
        reportdaysshared.map((rs)=>{
          if(rs[days[oneWeekAgo.getDay()]] != undefined){
            countshared = rs[days[oneWeekAgo.getDay()]];
          }
        });
        reportdaysuser.map((ru)=>{
          if(ru[days[oneWeekAgo.getDay()]] != undefined){
            countuser = ru[days[oneWeekAgo.getDay()]];
          }
        });
        datas.daywiseBooking.labels.push(days[oneWeekAgo.getDay()]);
        datas.daywiseBooking.data.push(count);
        datas.dailyrideshared.labels.push(days[oneWeekAgo.getDay()]);
        datas.dailyrideshared.data.push(countshared);
        datas.userdaywise.labels.push(days[oneWeekAgo.getDay()]);
        datas.userdaywise.data.push(countuser);
      }
      var latestrides = await BookedRide.aggregate([
        { $lookup: 
          {
            from: 'users',
            localField: 'user',
            foreignField: '_id',
            as: 'user'
          }
        },
        { $lookup: 
          {
            from: 'rides',
            localField: 'ride',
            foreignField: '_id',
            as: 'ride'
          }
        },
        {$sort:{createdOn:-1}}
      ]).limit(10);
      latestrides.map((latestride)=>{
        var rideDetails = {
          user:{
            name: (latestride?.user[0] != undefined)? `${latestride?.user[0]?.firstName} ${latestride?.user[0]?.lastName}` : '',
            email:latestride?.user[0]?.email?.emailId,
            DOB:latestride?.user[0]?.DOB,
            profilePicture:latestride?.user[0]?.profilePicture,
            mobile:latestride?.user[0]?.mobile?.mobileNumber,
          },
          bookingDate:latestride?.createdOn,
          status:latestride?.status,
          message:latestride?.message,
          startLocation:latestride?.ride[0]?.startLocation,
          endLocation:latestride?.ride[0]?.endLocation,
          totalDistance:latestride?.ride[0]?.totalDistance,
          totalTime:latestride?.ride[0]?.totalTime,
          tripPrise:latestride?.ride[0]?.tripPrise,
          tripDate:latestride?.ride[0]?.tripDate,
          tripTime:latestride?.ride[0]?.tripTime,
        }
        datas.latestride.push(rideDetails);
      });
      var canclerides = await BookedRide.aggregate([
        { $lookup: 
          {
            from: 'users',
            localField: 'user',
            foreignField: '_id',
            as: 'user'
          }
        },
        { $lookup: 
          {
            from: 'rides',
            localField: 'ride',
            foreignField: '_id',
            as: 'ride'
          }
        },
        {$match:{status:'Cancel'}},
        {$sort:{createdOn:-1}}
      ]).limit(10);
      canclerides.map((cancleride)=>{
        var rideDetails = {
          user:{
            name: (cancleride?.user[0] != undefined)? `${cancleride?.user[0]?.firstName} ${cancleride?.user[0]?.lastName}` : '',
            email:cancleride?.user[0]?.email?.emailId,
            DOB:cancleride?.user[0]?.DOB,
            profilePicture:cancleride?.user[0]?.profilePicture,
            mobile:cancleride?.user[0]?.mobile?.mobileNumber,
          },
          bookingDate:cancleride?.createdOn,
          status:cancleride?.status,
          message:cancleride?.message,
          startLocation:cancleride?.ride[0]?.startLocation,
          endLocation:cancleride?.ride[0]?.endLocation,
          totalDistance:cancleride?.ride[0]?.totalDistance,
          totalTime:cancleride?.ride[0]?.totalTime,
          tripPrise:cancleride?.ride[0]?.tripPrise,
          tripDate:cancleride?.ride[0]?.tripDate,
          tripTime:cancleride?.ride[0]?.tripTime,
        }
        datas.cancleride.push(rideDetails);
      });
      res.status(200).json({
        status: true,
        msg: "Dsahboard Report Generated successfully",
        datas,
      });
    } catch (error) {
      next(error);
    }
  });


  //Ride Report Start
  exports.rideReport = catchAsync(async (req, res, next) => {
    try {
      const rides = await Ride.find({});
      const newBooking = await BookedRide.find({status:'Booked'}).count();
      const newCustomers = await User.find({adminUserStatus:false}).count();
      var transactions = 0;
      rides.map((ride)=>{
        transactions += ((ride.passengerCount)*(ride.tripPrise));
      });
      var datas = {
        rideBooked:{
          totalRides:newBooking,
          newBooking:newBooking,
          newCustomers:newCustomers,
          transactions:transactions
        },
        rideShared:{
          totalRides:rides.length,
          newBooking:newBooking,
          newCustomers:newCustomers,
          transactions:transactions
        }
      };
      res.status(200).json({
        status: true,
        msg: "Booking Report Generated successfully",
        datas,
      });
    } catch (error) {
      next(error);
    }
  });

  //Ride Report End


  //Broadcast Notfication Start
  exports.broadcastNotification = async (req,res,next) =>{
    try{
      const {message} = req.body;
      const broadcast = new Broadcast({
        message:message,
        status:true
      });
      await broadcast.save();
      const users = await User.aggregate([
                            {$lookup:
                              {
                                from:"tokens",
                                localField:"_id",
                                foreignField:"user_id",
                                as:"token"
                              }
                            },
                          ]);
      var content = {
        body: message,
        image: "https://www.bft.org/assets/1/13/rider_alert2.jpg",
        click_action:"SOMEACTION",
      };
      users.map(async (user)=>{
        if(user?.token[0]?.token != undefined){
          var firebaseres = await firebase.sendNotification(user?.token[0]?.token, content);
        }
      });

      res.status(200).json({
        status:true,
        message:"Broadcast Message Sent Successfully to Users!!",
        data:users
      });
    } catch (error){
      next(error);
    }
  }
  //Broadcast Notfication end

  //Broadcast Message List Start
  exports.broadcastMessages = async (req,res,next) => {
    try{
      const broadcastMessages = await Broadcast.find({}).sort({createdOn:-1}).exec();
      res.status(200).json({
        status:true,
        message:"Broadcast Message List Successfully!!",
        data:broadcastMessages
      });
    } catch (error) {
      next(error);
    }
  }
  //Broadcast Message List end

  exports.transactionalReport = async (req,res,next) => {
    try{
      var datas = {
        turnOver:{
          labels: [],
          data: [],
        },
        activeUser:{
          labels: [],
          data: [],
        },
        latestBooking:{
          labels: [],
          data: [],
        },
      };
      // const rides= await Ride.find({rideStatus:{$ne:'Cancel'}});
      // datas.activeUsers = await User.find({adminUserStatus:false}).count();
      // rides.map((ride)=>{
      //   datas.totalturnover += (ride.tripPrise*(ride.passengerCount-totalSeatCount));
      // });
      var date = new Date();
      date.setDate(date.getDate() - 15);

      var turnOvers= await Ride.aggregate([
        {
          $match: {
            createdOn: {
              $gte: date
            } 
          } 
        }, { 
          $group: {
            _id: { 
              "year":  { "$year": "$createdOn" },
              "month": { "$month": "$createdOn" },
              "day":   { "$dayOfMonth": "$createdOn" }
            },
            count:{$sum: 1}
          }
        },
        {$match:{rideStatus:{$ne:'Cancel'}}},
        {$sort:{createdOn:1}}
      ]);
      var activeUsers= await User.aggregate([
        {
          $match: {
            createdOn: {
              $gte: date
            } 
          } 
        }, { 
          $group: {
            _id: { 
              "year":  { "$year": "$createdOn" },
              "month": { "$month": "$createdOn" },
              "day":   { "$dayOfMonth": "$createdOn" }
            },
            count:{$sum: 1}
          }
        },
        {$sort:{createdOn:1}}
      ]);
      var latestBookings= await BookedRide.aggregate([
        {
          $match: {
            createdOn: {
              $gte: date
            } 
          } 
        }, { 
          $group: {
            _id: { 
              "year":  { "$year": "$createdOn" },
              "month": { "$month": "$createdOn" },
              "day":   { "$dayOfMonth": "$createdOn" }
            },
            count:{$sum: 1}
          }
        },
        {$sort:{createdOn:1}}
      ]);
      for(var i= 15; i>=1;i--){
        turnCount = 0;
        userCount = 0;
        bookingCount = 0;
        chkDate = new Date();
        chkDate.setDate(chkDate.getDate() - i);
        turnOvers.map((t)=>{
          if(`${t._id.month}/${t._id.day}/${t._id.year}` == `${chkDate.getMonth()+1}/${chkDate.getDate()}/${chkDate.getFullYear()}`){
            turnCount = t.count;
          }
        });
        activeUsers.map((a)=>{
          if(`${a._id.month}/${a._id.day}/${a._id.year}` == `${chkDate.getMonth()+1}/${chkDate.getDate()}/${chkDate.getFullYear()}`){
            userCount = a.count;
          }
        });
        latestBookings.map((b)=>{
          if(`${b._id.month}/${b._id.day}/${b._id.year}` == `${chkDate.getMonth()+1}/${chkDate.getDate()}/${chkDate.getFullYear()}`){
            bookingCount = b.count;
          }
        });
        
        datevar = `${chkDate.getDate() > 9 ? chkDate.getDate() : '0'+chkDate.getDate() }-${(chkDate.getMonth()+1) > 9 ? (chkDate.getMonth()+1) : '0'+(chkDate.getMonth()+1)}-${chkDate.getFullYear()}`;
        datas.turnOver.labels.push(datevar);
        datas.turnOver.data.push(turnCount);
        datas.activeUser.labels.push(datevar);
        datas.activeUser.data.push(userCount);
        datas.latestBooking.labels.push(datevar);
        datas.latestBooking.data.push(bookingCount);
      }
      // const broadcastMessages = await Broadcast.find({}).sort({createdOn:-1}).exec();
      res.status(200).json({
        status:true,
        message:"Report Generated Successfully!!",
        data:datas
      });
    } catch (error) {
      next(error);
    }
  }

exports.blockUnblockUser = async (req,res,next) => {
  try {
    const { userId,profileStatus } = req.body;
    const userSave = await User.findByIdAndUpdate(
        { _id: userId },
        { 
          profileStatus       : profileStatus
        },
        { runValidator: true, useFindAndModify: false, new: true }
    );
    await userSave.save();
    if(profileStatus == false){
      await notificationController.postNotificationSelf(userSave._id, "Self", "Your Account has been Blocked, Please Contact Administrator...","AccountBlocked");

      if (userSave._id) {
        var content = {
          title: "Account Blocked",
          body: "Your Account has been Blocked, Please Contact Administrator...",
          image: "https://www.designbombs.com/wp-content/uploads/2021/07/How-to-Create-an-Anonymous-Email-and-Keep-Your-Identity-Safe-Online.png",
        };
        const key = await GetToken(userSave._id);
        if (key != "") {
          var firebaseres = await firebase.sendNotification(key, content);
        }
      }
    }else{
      await notificationController.postNotificationSelf(userSave._id, "Self", "Your Account has been Unblocked By Admin","AccountUnblocked");

      if (userSave._id) {
        var content = {
          title: "Account Unblocked",
          body: "Your Account has been Unblocked By Admin",
          image: "https://www.designbombs.com/wp-content/uploads/2021/07/How-to-Create-an-Anonymous-Email-and-Keep-Your-Identity-Safe-Online.png",
        };
        const key = await GetToken(userSave._id);
        if (key != "") {
          var firebaseres = await firebase.sendNotification(key, content);
        }
      }
    }
    Helper.response(true,`User has been ${(profileStatus == true) ? 'Unblocked' : 'Blocked'} Successfully!!`,userSave,res,200);
  } catch (error) {
    next(error);
  }
}


exports.businessSettingSave = (req,res,next) =>{
  try{
    BusinessSetting.findOne({type:req.body.type},(err,setting)=>{
        if(err){
          res.status(200).json({
            status:false,
            message:"Internal Server Occured!!",
            data:{errors:err}
          });
        }else if(setting==undefined){
            const settingobj = new BusinessSetting({ 
                type: req.body.type,
                value: req.body.value,
            });
            settingobj.save().then(() => {
                var data = settingobj;
                res.status(200).json({
                  status:true,
                  message:"Setting has been Added Successfully!!",
                  data:data
                });
            }).catch((error) => {
              res.status(200).json({
                status:false,
                message:"Internal Server Occured!!",
                data:{errors:error}
              });
            });
        }else {
          BusinessSetting.findOneAndUpdate({type:req.body.type},{$set:{value: req.body.value}}).exec((err,ChangeRes)=>{
              var data = {...ChangeRes._doc,value:req.body.value}
              res.status(200).json({
                status:true,
                message:"Setting has been Updated Successfully!!",
                data:data
              });
          });
        }
    });
  }catch (error){
    next(error);
  }
}

exports.businessSettingGet = (req,res,next) =>{
  try{
    BusinessSetting.findOne({type:req.body.type},(err,setting)=>{
      if(err){
        res.status(200).json({
          status:false,
          message:"Internal Server Occured!!",
          data:{errors:err}
        });
      }else if(setting==undefined || (setting == '' || setting == null)){
        res.status(200).json({
          status:false,
          message:"No Record Found!!",
          data:{}
        });
      }else {
        var data = setting
        res.status(200).json({
          status:true,
          message:"Record Fetched Successfully!!",
          data:data
        });
      }
    });
  } catch (error) {
    next(error);
  }
}

exports.businessSettingGetAll = async (req,res,next) =>{
  try{
    const data = await BusinessSetting.find({});
    if(data.length > 0){
      res.status(200).json({
        status:true,
        message:"Record Fetched Successfully!!",
        data:data
      });
    }else{
      res.status(200).json({
        status:false,
        message:"No Record Found!!",
        data:data
      });
    }
  } catch (error) {
    next(error);
  }
}

exports.uploadImage = async (req,res,next) => {
  try {
    const file = req?.files?.image;
    if(file === undefined){
      res.status(200).json({
        status:false,
        message:"Please Provide Image to Upload!!",
        data:{}
      });
    }
    Helper.imageUploadS3(file.tempFilePath,'bussinessSetings/'+Date())
    .then(async (location)=>{
      res.status(200).json({
        status: true,
        message:"Image Uploaded Successfully!!",
        data:location,
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
}