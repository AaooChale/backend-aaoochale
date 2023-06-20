const express = require("express");
const router = express.Router();
const ratingController = require("../controller/ratingController");
const {check,body,validationResult} = require("express-validator");

router.post("/createRating",
check("userId").not().isEmpty().withMessage('userId is required!!'),
check("driverId").not().isEmpty().withMessage('driverId is required!!'),
check("rideId").not().isEmpty().withMessage('rideId is required!!'),
check("message").not().isEmpty().withMessage('message is required!!'),
check("startRating").not().isEmpty().withMessage('startRating is required!!'),
(req,res,next)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        res.status(200).json({
            status:false,
            message:"Validation Error!!",
            data:{ errors: errors.array() }
        });
    }else{
        ratingController.createRating(req,res,next);
    }
});  
router.post("/getRating",
check("rideId").not().isEmpty().withMessage('rideId is required!!'),
(req,res,next)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        res.status(200).json({
            status:false,
            message:"Validation Error!!",
            data:{ errors: errors.array() }
        });
    }else{
        ratingController.getRating(req,res,next);
    }
});
router.post("/giveOwnRatingOfUser",
check("userId").not().isEmpty().withMessage('userId is required!!'),
(req,res,next)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        res.status(200).json({
            status:false,
            message:"Validation Error!!",
            data:{ errors: errors.array() }
        });
    }else{
        ratingController.giveOwnRatingOfUser(req,res,next);
    }
});
router.post("/getRatingOtherUserSend",
check("driverId").not().isEmpty().withMessage('driverId is required!!'),
(req,res,next)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        res.status(200).json({
            status:false,
            message:"Validation Error!!",
            data:{ errors: errors.array() }
        });
    }else{
        ratingController.getRatingOtherUserSend(req,res,next);
    }
});
router.patch("/replyDriver",
check("id").not().isEmpty().withMessage('id is required!!'),
check("sender").not().isEmpty().withMessage('sender is required!!'),
check("receiver").not().isEmpty().withMessage('receiver is required!!'),
check("reply").not().isEmpty().withMessage('reply is required!!'),
(req,res,next)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        res.status(200).json({
            status:false,
            message:"Validation Error!!",
            data:{ errors: errors.array() }
        });
    }else{
        ratingController.replyDriver(req,res,next);
    }
});
router.post("/getRatingDetailsById",
check("id").not().isEmpty().withMessage('rating id is required!!'),
(req,res,next)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        res.status(200).json({
            status:false,
            message:"Validation Error!!",
            data:{ errors: errors.array() }
        });
    }else{
        ratingController.getRatingDetailsById(req,res,next);
    }
});
router.post("/getAverageRatingByUserId",
check("userId").not().isEmpty().withMessage('userId is required!!'),
(req,res,next)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        res.status(200).json({
            status:false,
            message:"Validation Error!!",
            data:{ errors: errors.array() }
        });
    }else{
        ratingController.getAverageRatingByUserId(req,res,next);
    }
});

module.exports = router;
