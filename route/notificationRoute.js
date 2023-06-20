const path = require("path");
const express = require("express");
const router = express.Router();
const { check,body, validationResult } = require('express-validator');
const notificationController = require("../notification/notificationController");
const saveTokens = require("../notification/saveTocken");
router.post("/getAllNotifications", 
check('id').not().isEmpty().withMessage("The user id field is required!!"),
(req, res,next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(200).json({
            status: false,
            message: "validation Error",
            data: { errors: errors.array() },
        });
    }else{
        notificationController.getAllNotifications(req,res,next);
    }
});
router.post("/getNotificationById",
check('id').not().isEmpty().withMessage("The notification id is required!!"),
(req, res,next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(200).json({
            status: false,
            message: "validation Error",
            data: { errors: errors.array() },
        });
    }else{
        notificationController.getNotificationById(req,res,next);
    }
});
router.delete("/deleteNotification", 
check('notificationId').not().isEmpty().withMessage("The notification id is required!!"),
(req, res,next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(200).json({
            status: false,
            message: "validation Error",
            data: { errors: errors.array() },
        });
    }else{
        notificationController.deleteNotifications(req,res,next);
    }
});
router.post("/getAllNotificationsBySelf",
check('id').not().isEmpty().withMessage("The user id is required!!"),
(req, res,next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(200).json({
            status: false,
            message: "validation Error",
            data: { errors: errors.array() },
        });
    }else{
        notificationController.getAllNotificationsBySelf(req,res,next);
    }
});
router.post("/sendnotification",
check('sender').not().isEmpty().withMessage("The sender is required!!"),
check('receiver').not().isEmpty().withMessage("The receiver is required!!"),
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
        notificationController.sendnotification(req,res,next);
    }
});
router.post("/updateStatus", 
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
        notificationController.updateStatus(req,res,next);
    }
});
// save tocken
router.post("/saveToken", 
check('user_id').not().isEmpty().withMessage("The user_id field cannot be empty!!"),
check('token').not().isEmpty().withMessage("The token field cannot be empty!!"),
(req, res,next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(200).json({
            status: false,
            message: "validation Error",
            data: { errors: errors.array() },
        });
    }else{
        saveTokens.saveToken(req,res,next);
    }
});

router.get('/getNotificationTypes',
(req,res,next)=>{
    notificationController.getNotificationTypes(req,res,next);
});

module.exports = router;
