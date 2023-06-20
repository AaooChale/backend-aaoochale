const express = require("express");
const router = express.Router();
const rideBookedController = require("../controller/rideBookController");
const { check,body, validationResult } = require('express-validator');

router.post("/bookedRide", 
check('userId').not().isEmpty().withMessage("The userId is required!!"),
check('rideId').not().isEmpty().withMessage("The rideId is required!!"),
check('receiver').not().isEmpty().withMessage("The receiver is required!!"),
check('message').not().isEmpty().withMessage("The message is required!!"),
check('status').not().isEmpty().withMessage("The status is required!!"),
check('passengercount').not().isEmpty().withMessage("The passengercount is required!!"),
(req, res,next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(200).json({
            status: false,
            message: "validation Error",
            data: { errors: errors.array() },
        });
    }else{
        rideBookedController.bookedRide(req,res,next);
    }
});
router.post("/waitingbookedRide",
check('rideId').not().isEmpty().withMessage("The userId is required!!"),
(req, res,next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(200).json({
            status: false,   
            message: "validation Error",
            data: { errors: errors.array() },  
        });
    }else{
        rideBookedController.waitingbookedRide(req,res,next);
    }
});


router.post("/approveOrRejectBookedRide",
check('booked_ride_id').not().isEmpty().withMessage("The booked_ride_id is required!!"),
check('type').not().isEmpty().withMessage("The type is required!!"),
(req, res,next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(200).json({
            status: false,
            message: "validation Error",
            data: { errors: errors.array() },
        });
    }else{
        rideBookedController.approveOrRejectBookedRide(req,res,next);
    }
});


router.put("/cancleBookedRide",
check('id').not().isEmpty().withMessage("The booked ride id is required!!"),
check('status').not().isEmpty().withMessage("The status is required!!"),
check('message').not().isEmpty().withMessage("The message is required!!"),
(req, res,next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(200).json({
            status: false,
            message: "validation Error",
            data: { errors: errors.array() },
        });
    }else{
        rideBookedController.cancleBookedRide(req,res,next);
    }
});


router.post("/getBookedRide",
check('userId').not().isEmpty().withMessage("The userId is required!!"),
(req, res,next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(200).json({
            status: false,
            message: "validation Error",
            data: { errors: errors.array() },
        });
    }else{
        rideBookedController.getBookedRide(req,res,next);
    }
});


router.delete("/deleteRide", 
check('id').not().isEmpty().withMessage("The booked ride id is required!!"),
(req, res,next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(200).json({
            status: false,
            message: "validation Error",
            data: { errors: errors.array() },
        });
    }else{
        rideBookedController.deleteRide(req,res,next);
    }
});


router.post("/getAlreadyBookedPassenger", 
check('rideId').not().isEmpty().withMessage("The rideId is required!!"),
(req, res,next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(200).json({
            status: false,
            message: "validation Error",
            data: { errors: errors.array() },
        });
    }else{
        rideBookedController.getAlreadyBookedPassenger(req,res,next);
    }
});


router.post("/createRideView",
check('userId').not().isEmpty().withMessage("The userId is required!!"),
check('rideId').not().isEmpty().withMessage("The rideId is required!!"),
(req, res,next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(200).json({
            status: false,
            message: "validation Error",
            data: { errors: errors.array() },
        });
    }else{
        rideBookedController.createRideView(req,res,next);
    }
});


router.post("/getRideViewByRideId",
check('rideId').not().isEmpty().withMessage("The rideId is required!!"),
(req, res,next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(200).json({
            status: false,
            message: "validation Error",
            data: { errors: errors.array() },
        });
    }else{
        rideBookedController.getRideViewByRideId(req,res,next);
    }
});


router.post("/getbookedrideStatus",
check('userId').not().isEmpty().withMessage("The userId is required!!"),
check('bookedrideId').not().isEmpty().withMessage("The bookedrideId is required!!"),
(req, res,next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(200).json({
            status: false,
            message: "validation Error",
            data: { errors: errors.array() },
        });
    }else{
        rideBookedController.getbookedrideStatus(req,res,next);
    }
});

module.exports = router;
