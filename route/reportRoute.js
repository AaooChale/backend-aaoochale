const express = require("express");
const router = express.Router();
const reportController = require("../controller/reportController");
const {check,body,validationResult} = require('express-validator');

router.post("/createReport",
check('userId').not().isEmpty().withMessage('userId is required!!'),
(req,res,next)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        res.status(200).json({
            status:false,
            message:"Validation Error!!",
            data:{errors:errors.array()}
        });
    }else{
        reportController.createReport(req,res,next);
    }
});
router.post("/getReport",
check('userId').not().isEmpty().withMessage('userId is required!!'),
(req,res,next)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        res.status(200).json({
            status:false,
            message:"Validation Error!!",
            data:{errors:errors.array()}
        });
    }else{
        reportController.getReport(req,res,next);
    }
});

module.exports = router;
  