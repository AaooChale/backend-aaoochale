const express = require("express");
const path = require("path");
const userAuthController = require("../controller/userAuthController");
const upload = require("../controller/vehicleController");
const Authenticate = require("../middleware/Authenticate");
const {check,body,validationResult} = require('express-validator');
const Helper = require('../config/Helper');
const router = express.Router();


router.post("/login",
check('mobileNumber').not().isEmpty().withMessage('The mobileNumber is required!!'),
(req,res,next)=>{
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    res.status(200).json({
      status:false,
      message:"Validation Error!!",
      data:{errors:errors.array()}
    });
  }else{
    userAuthController.login(req,res,next);
  }
});  


router.post("/loginMobileOTP",
check('mobile').not().isEmpty().withMessage('The mobile is required!!'),
check('otp').not().isEmpty().withMessage('The otp is required!!'),
(req,res,next)=>{
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    res.status(200).json({
      status:false,
      message:"Validation Error!!",
      data:{errors:errors.array()}
    });
  }else{
    userAuthController.loginMobileOTP(req,res,next);
  }
}); 



router.get("/logout", userAuthController.logout);


router.post("/forgotPwdGenerateOtp",
check('email').not().isEmpty().withMessage('The email is required!!'),
(req,res,next)=>{
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    res.status(200).json({
      status:false,
      message:"Validation Error!!",
      data:{errors:errors.array()}
    });
  }else{
    userAuthController.forgotPwdGenerateOtp(req,res,next);
  }
});


router.post("/forgotPwdVerifyOtp",
check('email').not().isEmpty().withMessage('The email is required!!'),
check('otp').not().isEmpty().withMessage('The otp is required!!'),
(req,res,next)=>{
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    res.status(200).json({
      status:false,
      message:"Validation Error!!",
      data:{errors:errors.array()}
    });
  }else{
    userAuthController.forgotPwdVerifyOtp(req,res,next);
  }
});


router.post("/verifyMobileSendOtp",
check('mobile').not().isEmpty().withMessage('The mobile is required!!'),
(req,res,next)=>{
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    res.status(200).json({
      status:false,
      message:"Validation Error!!",
      data:{errors:errors.array()}
    });
  }else{
    userAuthController.verifyMobileSendOtp(req,res,next);
  }
});



router.post("/verifyReceivedMobileOTP",
check('mobile').not().isEmpty().withMessage('The mobile is required!!'),
check('otp').not().isEmpty().withMessage('The otp is required!!'),
(req,res,next)=>{
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    res.status(200).json({
      status:false,
      message:"Validation Error!!",
      data:{errors:errors.array()}
    });
  }else{
    userAuthController.verifyReceivedMobileOTP(req,res,next);
  }
});


router.post("/updateMobile",
check('id').not().isEmpty().withMessage('The user id is required!!'),
check('mobileNumber').not().isEmpty().withMessage('The mobileNumber is required!!'),
(req,res,next)=>{
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    res.status(200).json({
      status:false,
      message:"Validation Error!!",
      data:{errors:errors.array()}
    });
  }else{
    userAuthController.updateMobile(req,res,next);
  }
});


router.post("/verifyUpdateMobile",
check('id').not().isEmpty().withMessage('The user id is required!!'),
check('otp').not().isEmpty().withMessage('The otp is required!!'),
check('mobileNumber').not().isEmpty().withMessage('The mobileNumber is required!!'),
(req,res,next)=>{
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    res.status(200).json({
      status:false,
      message:"Validation Error!!",
      data:{errors:errors.array()}
    });
  }else{
    userAuthController.verifyUpdateMobile(req,res,next);
  }
});


router.post("/uploadUsertImage",
check('id').not().isEmpty().withMessage('The user id is required!!'),
(req,res,next)=>{
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    res.status(200).json({
      status:false,
      message:"Validation Error!!",
      data:{errors:errors.array()}
    });
  }else{
    userAuthController.uploadUsertImage(req,res,next);
  }
});



router.post("/uploadUserDocuments", 
check('id').not().isEmpty().withMessage('The user id is required!!'),
check('documentName').not().isEmpty().withMessage('The documentName is required!!'),
(req,res,next)=>{
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    res.status(200).json({
      status:false,
      message:"Validation Error!!",
      data:{errors:errors.array()}
    });
  }else{
    userAuthController.uploadUserDocuments(req,res,next);
  }
});



router.post("/uploadPanCard",
check('id').not().isEmpty().withMessage('The user id is required!!'),
check('documentName').not().isEmpty().withMessage('The documentName is required!!'),
(req,res,next)=>{
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    res.status(200).json({
      status:false,
      message:"Validation Error!!",
      data:{errors:errors.array()}
    });
  }else{
    userAuthController.uploadPanCard(req,res,next);
  }
});


router.post("/getUserStatus",
check('userId').not().isEmpty().withMessage('The userId is required!!'),
(req,res,next)=>{
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    res.status(200).json({
      status:false,
      message:"Validation Error!!",
      data:{errors:errors.array()}
    });
  }else{
    userAuthController.getUserStatus(req,res,next);
  }
});



router.post("/googleLogin", userAuthController.googleLogin);
router.get('/countryList',userAuthController.countryList);
router.get('/sendMailTesting',userAuthController.sendMailTesting);
router.post('/s3test',userAuthController.s3test);
router.post('/queueTest',userAuthController.queueTest);

router.post("/updateCurrentLocation",
check('userId').not().isEmpty().withMessage('The userId is required!!'),
(req,res,next)=>{
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    res.status(200).json({
      status:false,
      message:"Validation Error!!",
      data:{errors:errors.array()}
    });
  }else{
    userAuthController.updateCurrentLocation(req,res,next);
  }
});

// TESTING ROUTE
router.get("/test-route", (req, res, next) => {
  res.status(200).json({
    status: "success",
    data: {
      message: "user is able to login.....",
      doc: req.user,
    },
  });
});

//Testing Route for City Radius
router.post("/testcityradius", async (req, res, next) => {
  const radius = Helper.cityRadius(28.4601,77.02635);
  console.log(radius);
  res.send("okk");
});



module.exports = router;
