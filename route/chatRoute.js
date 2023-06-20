const express = require("express");
const router = express.Router();
const userAuthController = require("../controller/userAuthController");
const chatController = require("../controller/chatController");
const {check,body,validationResult} = require("express-validator");

router.post("/createChat",
check('senderId').not().isEmpty().withMessage('senderId is required!!'),
check('receiverId').not().isEmpty().withMessage('receiverId is required!!'),
check('rideId').not().isEmpty().withMessage('rideId is required!!'),
check('status').not().isEmpty().withMessage('status is required!!'),
check('message').not().isEmpty().withMessage('message is required!!'),
(req,res,next)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        res.status(200).json({
            status:false,
            message:"Validation Error!!",
            data:{ errors: errors.array() }
        });
    }else{
        chatController.createChat(req,res,next);  
    }
});
router.post("/getAllChat",
check('senderId').not().isEmpty().withMessage('senderId is required!!'),
check('receiverId').not().isEmpty().withMessage('receiverId is required!!'),
check('rideId').not().isEmpty().withMessage('rideId is required!!'),
(req,res,next)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        res.status(200).json({
            status:false,
            message:"Validation Error!!",
            data:{ errors: errors.array() }
        });
    }else{
        chatController.getAllChat(req,res,next);  
    }
});
router.post("/getAllChatBySenderId",
check('id').not().isEmpty().withMessage('sender id is required!!'),
(req,res,next)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        res.status(200).json({
            status:false,
            message:"Validation Error!!",
            data:{ errors: errors.array() }
        });
    }else{
        chatController.getAllChatBySenderId(req,res,next);  
    }
});
router.post("/getAllChatByReceiverId",
check('id').not().isEmpty().withMessage('receiver id is required!!'),
(req,res,next)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        res.status(200).json({
            status:false,
            message:"Validation Error!!",
            data:{ errors: errors.array() }
        });
    }else{
        chatController.getAllChatByReceiverId(req,res,next);  
    }
});
router.post("/getAllChatBySenderIdAndReceiverId",
check('senderId').not().isEmpty().withMessage('senderId is required!!'),
check('receiverId').not().isEmpty().withMessage('receiverId is required!!'),
(req,res,next)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        res.status(200).json({
            status:false,
            message:"Validation Error!!",
            data:{ errors: errors.array() }
        });
    }else{
        chatController.getAllChatBySenderIdAndReceiverId(req,res,next);  
    }
});
router.post("/getUserChatHistory",
check('id').not().isEmpty().withMessage('user id is required!!'),
(req,res,next)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        res.status(200).json({
            status:false,
            message:"Validation Error!!",
            data:{ errors: errors.array() }
        });
    }else{
        chatController.getUserChatHistory(req,res,next);  
    }
}); 
module.exports = router;
