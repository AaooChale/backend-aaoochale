const express = require("express");
const router = express.Router();
const notificationMsgController = require("../controller/notificationMsgController");
const { check,body, validationResult } = require('express-validator');


router.post("/addMsg", 
check('type').not().isEmpty().withMessage("The type field cannot be empty!!"),
check('msg').not().isEmpty().withMessage("The msg field cannot be empty!!"),
(req, res,next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(200).json({
            status: false,
            message: "validation Error",
            data: { errors: errors.array() },
        });
    }else{
        notificationMsgController.addMsg(req,res,next);
    }
});


router.post("/msgList", 
(req, res,next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(200).json({
            status: false,
            message: "validation Error",
            data: { errors: errors.array() },
        });
    }else{
        notificationMsgController.msgList(req,res,next);
    }
});


router.post("/msgUpdate", 
check('id').not().isEmpty().withMessage("The id field cannot be empty!!"),
check('type').not().isEmpty().withMessage("The type field cannot be empty!!"),
check('msg').not().isEmpty().withMessage("The msg field cannot be empty!!"),
(req, res,next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(200).json({
            status: false,
            message: "validation Error",
            data: { errors: errors.array() },
        });
    }else{
        notificationMsgController.msgUpdate(req,res,next);
    }
});

router.post("/msgDelete", 
check('id').not().isEmpty().withMessage("The id field cannot be empty!!"),
(req, res,next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(200).json({
            status: false,
            message: "validation Error",
            data: { errors: errors.array() },
        });
    }else{
        notificationMsgController.msgDelete(req,res,next);
    }
});


module.exports = router;
