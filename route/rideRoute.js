const express = require("express");
const router = express.Router();
const rideController = require("../controller/rideController");
const { check,body, validationResult } = require('express-validator');

router.post("/createRide",
check('pickUpLocation').not().isEmpty().withMessage('The pickUpLocation is required!!'),
check('pickupLat').not().isEmpty().withMessage('The pickupLat is required!!'),
check('pickLong').not().isEmpty().withMessage('The pickLong is required!!'),
check('dropLocation').not().isEmpty().withMessage('The dropLocation is required!!'),
check('dropLat').not().isEmpty().withMessage('The dropLat is required!!'),
check('dropLong').not().isEmpty().withMessage('The dropLong is required!!'),
check('tripDate').not().isEmpty().withMessage('The tripDate is required!!'),
check('tripTime').not().isEmpty().withMessage('The tripTime is required!!'),
check('totalDistance').not().isEmpty().withMessage('The totalDistance is required!!'),
check('totalTime').not().isEmpty().withMessage('The totalTime is required!!'),
check('backSeatEmpty').not().isEmpty().withMessage('The backSeatEmpty is required!!'),
check('passengerCount').not().isEmpty().withMessage('The passengerCount is required!!'),
check('rideApproval').not().isEmpty().withMessage('The rideApproval is required!!'),
check('tripPrise').not().isEmpty().withMessage('The tripPrise is required!!'),
check('select_route').not().isEmpty().withMessage('The select_route is required!!'),
check('startLocation').not().isEmpty().withMessage('The startLocation is required!!'),
check('endLocation').not().isEmpty().withMessage('The endLocation is required!!'),
check('rideStatus').not().isEmpty().withMessage('The rideStatus is required!!'),
check('vehicleSelect').not().isEmpty().withMessage('The vehicleSelect is required!!'),
check('userId').not().isEmpty().withMessage('The userId is required!!'),
check('arrivalTime').not().isEmpty().withMessage('The arrivalTime is required!!'),
check('destinationTime').not().isEmpty().withMessage('The destinationTime is required!!'),
(req,res,next)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        res.status(200).json({
            status:false,
            message:"Validation Error",
            data:{errors:errors.array()}
        });
    }else{
        rideController.createRide(req,res,next);
    }
});


router.post("/getRide",
check('id').not().isEmpty().withMessage('The ride id is required!!'),
(req,res,next)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        res.status(200).json({
            status:false,
            message:"Validation Error",
            data:{errors:errors.array()}
        });
    }else{
        rideController.getRide(req,res,next);
    }
});


router.delete("/deleteRide",
check('id').not().isEmpty().withMessage('The ride id is required!!'),
(req,res,next)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        res.status(200).json({
            status:false,
            message:"Validation Error",
            data:{errors:errors.array()}
        });
    }else{
        rideController.deleteRide(req,res,next);
    }
});


router.post("/countDistance", 
check('id').not().isEmpty().withMessage('The ride id is required!!'),
(req,res,next)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        res.status(200).json({
            status:false,
            message:"Validation Error",
            data:{errors:errors.array()}
        });
    }else{
        rideController.countDistance(req,res,next);
    }
});


router.post("/searchJobs",
check('pickupLat').not().isEmpty().withMessage('The pickupLat is required!!'),
check('pickLong').not().isEmpty().withMessage('The pickLong is required!!'),
check('dropLat').not().isEmpty().withMessage('The dropLat is required!!'),
check('dropLong').not().isEmpty().withMessage('The dropLong is required!!'),
check('userId').not().isEmpty().withMessage('The userId is required!!'),
check('tripDate').not().isEmpty().withMessage('The tripDate is required!!'),
check('passengerCount').not().isEmpty().withMessage('The passengerCount is required!!'),
(req,res,next)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        res.status(200).json({
            status:false,
            message:"Validation Error",
            data:{errors:errors.array()}
        });
    }else{
        rideController.searchJobs(req,res,next);
    }
});


router.post("/getRideByUserId",
check('id').not().isEmpty().withMessage('The user id is required!!'),
(req,res,next)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        res.status(200).json({
            status:false,
            message:"Validation Error",
            data:{errors:errors.array()}
        });
    }else{
        rideController.getRideByUserId(req,res,next);
    }
});


router.put("/updateRideDetails",
check('id').not().isEmpty().withMessage('The ride id is required!!'),
// check('pickUpLocation').not().isEmpty().withMessage('The pickUpLocation is required!!'),
// check('pickupLat').not().isEmpty().withMessage('The pickupLat is required!!'),
// check('pickLong').not().isEmpty().withMessage('The pickLong is required!!'),
// check('dropLocation').not().isEmpty().withMessage('The dropLocation is required!!'),
// check('dropLat').not().isEmpty().withMessage('The dropLat is required!!'),
// check('dropLong').not().isEmpty().withMessage('The dropLong is required!!'),
// check('tripDate').not().isEmpty().withMessage('The tripDate is required!!'),
// check('tripTime').not().isEmpty().withMessage('The tripTime is required!!'),
// check('totalDistance').not().isEmpty().withMessage('The totalDistance is required!!'),
// check('totalTime').not().isEmpty().withMessage('The totalTime is required!!'),
// check('backSeatEmpty').not().isEmpty().withMessage('The backSeatEmpty is required!!'),
// check('passengerCount').not().isEmpty().withMessage('The passengerCount is required!!'),
// check('rideApproval').not().isEmpty().withMessage('The rideApproval is required!!'),
// check('tripPrise').not().isEmpty().withMessage('The tripPrise is required!!'),
// check('select_route').not().isEmpty().withMessage('The select_route is required!!'),
check('rideStatus').not().isEmpty().withMessage('The rideStatus is required!!'),
// check('arrivalTime').not().isEmpty().withMessage('The arrivalTime is required!!'),
// check('destinationTime').not().isEmpty().withMessage('The destinationTime is required!!'),
(req,res,next)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        res.status(200).json({
            status:false,
            message:"Validation Error",
            data:{errors:errors.array()}
        });
    }else{
        rideController.updateRideDetails(req,res,next);
    }
});


router.patch("/changeRideStatus",
check('id').not().isEmpty().withMessage('The id is required!!'),
check('rideStatus').not().isEmpty().withMessage('The rideStatus is required!!'),
(req,res,next)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        res.status(200).json({
            status:false,
            message:"Validation Error",
            data:{errors:errors.array()}
        });
    }else{
        rideController.changeRideStatus(req,res,next);
    }
});


router.patch("/cancleRide",
check('id').not().isEmpty().withMessage('The id is required!!'),
check('rideStatus').not().isEmpty().withMessage('The rideStatus is required!!'),
check('userId').not().isEmpty().withMessage('The userId is required!!'),
check('massage').not().isEmpty().withMessage('The massage is required!!'),
(req,res,next)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        res.status(200).json({
            status:false,
            message:"Validation Error",
            data:{errors:errors.array()}
        });
    }else{
        rideController.cancleRide(req,res,next);
    }
});


router.post("/createRideAlert",
check('userId').not().isEmpty().withMessage('The userId is required!!'),
check('startLocation').not().isEmpty().withMessage('The startLocation is required!!'),
check('endLocation').not().isEmpty().withMessage('The endLocation is required!!'),
check('startLat').not().isEmpty().withMessage('The startLat is required!!'),
check('startLong').not().isEmpty().withMessage('The startLong is required!!'),
check('endLat').not().isEmpty().withMessage('The endLat is required!!'),
check('endLong').not().isEmpty().withMessage('The endLong is required!!'),
check('date').not().isEmpty().withMessage('The date is required!!'),
check('peopleCount').not().isEmpty().withMessage('The peopleCount is required!!'),
(req,res,next)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        res.status(200).json({
            status:false,
            message:"Validation Error",
            data:{errors:errors.array()}
        });
    }else{
        rideController.createRideAlert(req,res,next);
    }
});

 
router.post("/copyRide", 
check('userId').not().isEmpty().withMessage("The userId field cannot be empty!!"),
check('rideId').not().isEmpty().withMessage("The rideId field cannot be empty!!"),
check('tripDate').not().isEmpty().withMessage("The tripDate field cannot be empty!!"),
check('tripTime').not().isEmpty().withMessage("The tripTime field cannot be empty!!"),
check('tripPrise').not().isEmpty().withMessage("The tripPrise field cannot be empty!!"),
(req, res,next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(200).json({
            status: false,
            message: "validation Error",
            data: { errors: errors.array() },
        });
    }else{
        rideController.copyRide(req,res,next);
    }
}); 
 
router.post("/deleteStopCity", 
check('rideId').not().isEmpty().withMessage("The rideId field cannot be empty!!"),
check('stopCityId').not().isEmpty().withMessage("The stopCityId field cannot be empty!!"),
(req, res,next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(200).json({
            status: false,
            message: "validation Error",
            data: { errors: errors.array() },
        });
    }else{
        rideController.deleteStopCity(req,res,next);
    }
}); 

router.post("/updateStopCity", 
check('rideId').not().isEmpty().withMessage("The rideId field cannot be empty!!"),
check('stopCityId').not().isEmpty().withMessage("The stopCityId field cannot be empty!!"),
(req, res,next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(200).json({
            status: false,
            message: "validation Error",
            data: { errors: errors.array() },
        });
    }else{
        rideController.updateStopCity(req,res,next);
    }
}); 


router.post("/addStopCity", 
check('rideId').not().isEmpty().withMessage("The rideId field cannot be empty!!"),
(req, res,next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(200).json({
            status: false,
            message: "validation Error",
            data: { errors: errors.array() },
        });
    }else{
        rideController.addStopCity(req,res,next);
    }
}); 

module.exports = router;
