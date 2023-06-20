const express = require("express");
const path = require("path");
const userAuthController = require("../controller/userAuthController");
const userPerInfoController = require("../controller/userPerInfoController");
const { check,body, validationResult } = require('express-validator');
const router = express.Router();


router.post("/getUserPersoInfo",
check('id').not().isEmpty().withMessage("The user id is required!!"),
(req,res,next)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(200).json({
            status: false,
            message: "validation Error",
            data: { errors: errors.array() },
        });
    }else{
        userPerInfoController.getUserPersoInfo(req,res,next);
    }
});


router.post("/notificationByEmail",
check('id').not().isEmpty().withMessage("The user id is required!!"),
(req,res,next)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(200).json({
            status: false,
            message: "validation Error",
            data: { errors: errors.array() },
        });
    }else{
        userPerInfoController.notificationByEmail(req,res,next);
    }
});


router.post("/notificationByprofilePicture",
check('id').not().isEmpty().withMessage("The user id is required!!"),
(req,res,next)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(200).json({
            status: false,
            message: "validation Error",
            data: { errors: errors.array() },
        });
    }else{
        userPerInfoController.notificationByprofilePicture(req,res,next);
    }
});

router.post("/addUserPersoInfo",
check('id').not().isEmpty().withMessage("The user id is required!!"),
check('firstName').not().isEmpty().withMessage("The firstName is required!!"),
check('lastName').not().isEmpty().withMessage("The lastName is required!!"),
(req,res,next)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(200).json({
            status: false,
            message: "validation Error",
            data: { errors: errors.array() },
        });
    }else{
        userPerInfoController.addUserPersoInfo(req,res,next);
    }
});


router.put("/updateUserPersoInfo",
check('id').not().isEmpty().withMessage("The user id is required!!"),
(req,res,next)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(200).json({
            status: false,
            message: "validation Error",
            data: { errors: errors.array() },
        });
    }else{
        userPerInfoController.updateUserPersoInfo(req,res,next);
    }
});


router.patch("/updateUserPreferences",
check('id').not().isEmpty().withMessage("The user id is required!!"),
(req,res,next)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(200).json({
            status: false,
            message: "validation Error",
            data: { errors: errors.array() },
        });
    }else{
        userPerInfoController.updateUserPreferences(req,res,next);
    }
});


router.post("/ratingReviews",
check('userId').not().isEmpty().withMessage("The userId is required!!"),
(req,res,next)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(200).json({
            status: false,
            message: "validation Error",
            data: { errors: errors.array() },
        });
    }else{
        userPerInfoController.ratingReviews(req,res,next);
    }
});


router.post("/userActivityRideAndRating",
check('userId').not().isEmpty().withMessage("The userId is required!!"),
(req,res,next)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(200).json({
            status: false,
            message: "validation Error",
            data: { errors: errors.array() },
        });
    }else{
        userPerInfoController.userActivityRideAndRating(req,res,next);
    }
});


router.post('/addAlternateNumber',
check('userId').not().isEmpty().withMessage('userId Field is required!!'),
check('mobile').not().isEmpty().withMessage('Mobile Number Field is required!!'),
(req,res,next)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(200).json({
            status: false,
            message: "validation Error",
            data: { errors: errors.array() },
        });
    }else{
        userPerInfoController.addAlternateNumber(req,res,next);
    }
});
module.exports = router;
