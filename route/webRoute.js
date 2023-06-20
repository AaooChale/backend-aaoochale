const express = require("express");
const router = express.Router();
const WebController = require("../controller/WebController");
const { check,body, validationResult } = require('express-validator');

//business settings List
router.post('/business_settings_get',
check('type').not().isEmpty().withMessage("The Type field cannot be empty!!"),
(req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(200).json({
            status:false,
            message:"validation Error",
            data:{errors: errors.array()}
        });
    }else{
        WebController.businessSettingGet(req,res,next);
    }   
});


//business settings List
router.post('/business_settings_get_all',(req, res,next) => { 
    WebController.businessSettingGetAll(req,res,next);
});
router.post('/faqList',(req, res,next) => { 
    WebController.faqList(req,res,next);
});
router.post('/testimonialList',(req, res,next) => { 
    WebController.testimonialList(req,res,next);
});
router.post('/blogList',(req, res,next) => { 
    WebController.blogList(req,res,next);
});
module.exports = router;
