const express = require("express");
const router = express.Router();
const adminController = require("../controller/adminController");
const FaqController = require("../controller/FaqController");
const TestimonialController = require("../controller/TestimonialController");
const BlogController = require("../controller/BlogController");
const Authenticate = require("../middleware/Authenticate");
const { check,body, validationResult } = require('express-validator');

router.post("/getAllUsers",adminController.getAllUsers);
router.post("/adminLogin",
check('email').not().isEmpty().withMessage('Email is required!!'),
check('password').not().isEmpty().withMessage('Password is required!!'),
(req,res,next)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        res.status(200).json({
            status: false,
            message: "validation Error",
            data: { errors: errors.array() },
        });
    }else{
        adminController.adminLogin(req,res,next);
    }
});
router.post("/mangeUserStatus",Authenticate,
check('id').not().isEmpty().withMessage('id is required!!'),
check('status').not().isEmpty().withMessage('status is required!!'),
(req,res,next)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        res.status(200).json({
            status:false,
            message:"validation Error",
            data:{errors: errors.array()}
        });
    }else{
        adminController.mangeUserStatus(req,res,next);
    }
});
router.post("/UserAllDoc", Authenticate,adminController.UserAllDoc);
router.get("/AllCreatedRides",Authenticate, adminController.AllCreatedRides);
router.get("/AllBookedRides",Authenticate, adminController.AllBookedRides);
router.get("/AllRating",Authenticate, adminController.AllRating);
router.get("/AllReport",Authenticate, adminController.AllReport);
router.get("/AllVehicle",Authenticate, adminController.AllVehicle);   
router.get("/DashbaordReport",Authenticate, adminController.DashbaordReport);   
router.get("/rideReport",Authenticate, adminController.rideReport);      
router.post("/broadcastNotification",Authenticate,
check('message').not().isEmpty().withMessage('message is required!!'),
(req,res,next)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        res.status(200).json({
            status:false,
            message:"validation Error",
            data:{errors: errors.array()}
        });
    }else{
        adminController.broadcastNotification(req,res,next);
    }
});

router.get("/broadcastMessages",Authenticate, adminController.broadcastMessages);  
router.get("/transactionalReport",Authenticate, adminController.transactionalReport);  

router.post("/blockUnblockUser",Authenticate,
check('userId').not().isEmpty().withMessage('userId field is required!!'),
check('profileStatus').not().isEmpty().withMessage('profileStatus field is required!!'),
(req,res,next)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        res.status(200).json({
            status:false,
            message:"validation Error",
            data:{errors: errors.array()}
        });
    }else{
        adminController.blockUnblockUser(req,res,next);
    }
});

router.post('/business_settings_save',Authenticate,
check('type').not().isEmpty().withMessage("The Type field cannot be empty!!"),
body('value').not().isEmpty().withMessage("The Value field cannot be empty!!"),
(req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(200).json({
            status:false,
            message:"validation Error",
            data:{errors: errors.array()}
        });
    }else{
        adminController.businessSettingSave(req,res,next);
    }
});


//business settings List
router.post('/business_settings_get',Authenticate,
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
        adminController.businessSettingGet(req,res,next);
    }   
});


//business settings List
router.post('/business_settings_get_all',Authenticate,(req, res,next) => { 
    adminController.businessSettingGetAll(req,res,next);
});


router.post('/uploadImage',Authenticate,(req, res,next) => { 
    adminController.uploadImage(req,res,next);
});

require('express-group-routes');


// Faq Api Start  
router.group("/faq", (router) => {
    //add Api
    router.post("/add",Authenticate,
    check('question').not().isEmpty().withMessage("The Question field cannot be empty!!"),
    // .custom(value => {
    //     return Role.findOne({name: value})
    //     .then((role) => {
    //         if(role){
    //             return Promise.reject('Name has been already taken!!')
    //         }
    //     })
    // }),
    body('answer').not().isEmpty().withMessage("The Answer field cannot be empty!!"),
    //body('type_id').not().isEmpty().withMessage("The Type field cannot be empty!!"),
    body('status').not().isEmpty().withMessage("The Status field cannot be empty!!"),
    (req,res,next)=>{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(200).json({
                status:false,
                message:"validation Error",
                data:{errors: errors.array()}
            });
        }else{
            FaqController.add(req,res,next);  
        }
    }); 

    // List Api
    router.post("/",Authenticate,
    (req,res,next)=>{
        FaqController.list(req,res,next);
    }); 


    //Category Edit Api
    router.post("/edit",Authenticate,
    check('id').not().isEmpty().withMessage("The Id field is required!!"),
    (req,res,next)=>{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(200).json({
                status:false,
                message:"validation Error",
                data:{errors: errors.array()}
            });
        }else{
            FaqController.edit(req,res,next);   
        }  
    }); 
    
    
    //Update Api
    router.post("/update",Authenticate,
    //check('question').not().isEmpty().withMessage("The Question field cannot be empty!!"),
    // .custom(value => {
    //     return Role.findOne({name: value})
    //     .then((role) => {
    //         if(role){
    //             return Promise.reject('Name has been already taken!!')
    //         }
    //     })
    // }),
    body('answer').not().isEmpty().withMessage("The Answer field cannot be empty!!"),
    //body('type_id').not().isEmpty().withMessage("The Type field cannot be empty!!"),
    body('status').not().isEmpty().withMessage("The Status field cannot be empty!!"),
    (req,res,next)=>{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(200).json({
                status:false,
                message:"validation Error",
                data:{errors: errors.array()}
            });
        }else{
            FaqController.update(req,res,next);  
        }
    }); 


    //Delete Api
    router.post("/delete",Authenticate,
    check('id').not().isEmpty().withMessage("The Id field is required!!"),
    (req,res,next)=>{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(200).json({
                status:false,
                message:"validation Error",
                data:{errors: errors.array()}
            });
        }else{
            FaqController.delete(req,res,next);
        }
    });
});
// Faq Api End 



// Testimonial Api Start  
router.group("/testimonial", (router) => {
    //add Api
    router.post("/add",Authenticate,
    body('name').not().isEmpty().withMessage("The Name field cannot be empty!!"),
    body('designation').not().isEmpty().withMessage("The Designation field cannot be empty!!"),
    body('review').not().isEmpty().withMessage("The Review field cannot be empty!!"),
    body('status').not().isEmpty().withMessage("The Status field cannot be empty!!"),
    (req,res,next)=>{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(200).json({
                status:false,
                message:"validation Error",
                data:{errors: errors.array()}
            });
        }else{
            TestimonialController.add(req,res,next);  
        }
    }); 

    // List Api
    router.post("/",Authenticate,
    (req,res,next)=>{
        TestimonialController.list(req,res,next);
    }); 


    //Category Edit Api
    router.post("/edit",Authenticate,
    check('id').not().isEmpty().withMessage("The Id field is required!!"),
    (req,res,next)=>{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(200).json({
                status:false,
                message:"validation Error",
                data:{errors: errors.array()}
            });
        }else{
            TestimonialController.edit(req,res,next);   
        }  
    }); 
    
    
    //Update Api
    router.post("/update",Authenticate,
    check('id').not().isEmpty().withMessage("The id field cannot be empty!!"),
    body('name').not().isEmpty().withMessage("The Name field cannot be empty!!"),
    body('designation').not().isEmpty().withMessage("The Designation field cannot be empty!!"),
    body('review').not().isEmpty().withMessage("The Review field cannot be empty!!"),
    body('status').not().isEmpty().withMessage("The Status field cannot be empty!!"),
    (req,res,next)=>{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(200).json({
                status:false,
                message:"validation Error",
                data:{errors: errors.array()}
            });
        }else{
            TestimonialController.update(req,res,next);  
        }
    }); 


    //Delete Api
    router.post("/delete",Authenticate,
    check('id').not().isEmpty().withMessage("The Id field is required!!"),
    (req,res,next)=>{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(200).json({
                status:false,
                message:"validation Error",
                data:{errors: errors.array()}
            });
        }else{
            TestimonialController.delete(req,res,next);
        }
    });
});
// Testimonial Api End 


// Blog Api Start  
router.group("/blog", (router) => {
    //add Api
    router.post("/add",Authenticate,
    body('title').not().isEmpty().withMessage("The Name field cannot be empty!!"),
    body('description').not().isEmpty().withMessage("The description field cannot be empty!!"),
    body('shortDescription').not().isEmpty().withMessage("The shortDescription field cannot be empty!!"),
    body('status').not().isEmpty().withMessage("The Status field cannot be empty!!"),
    (req,res,next)=>{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(200).json({
                status:false,
                message:"validation Error",
                data:{errors: errors.array()}
            });
        }else{
            BlogController.add(req,res,next);  
        }
    }); 

    // List Api
    router.post("/",Authenticate,
    (req,res,next)=>{
        BlogController.list(req,res,next);
    }); 


    //Category Edit Api
    router.post("/edit",Authenticate,
    check('id').not().isEmpty().withMessage("The Id field is required!!"),
    (req,res,next)=>{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(200).json({
                status:false,
                message:"validation Error",
                data:{errors: errors.array()}
            });
        }else{
            BlogController.edit(req,res,next);   
        }  
    }); 
    
    
    //Update Api
    router.post("/update",Authenticate,
    check('id').not().isEmpty().withMessage("The id field cannot be empty!!"),
    body('title').not().isEmpty().withMessage("The Name field cannot be empty!!"),
    body('description').not().isEmpty().withMessage("The description field cannot be empty!!"),
    body('shortDescription').not().isEmpty().withMessage("The shortDescription field cannot be empty!!"),
    body('status').not().isEmpty().withMessage("The Status field cannot be empty!!"),
    (req,res,next)=>{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(200).json({
                status:false,
                message:"validation Error",
                data:{errors: errors.array()}
            });
        }else{
            BlogController.update(req,res,next);  
        }
    }); 


    //Delete Api
    router.post("/delete",Authenticate,
    check('id').not().isEmpty().withMessage("The Id field is required!!"),
    (req,res,next)=>{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(200).json({
                status:false,
                message:"validation Error",
                data:{errors: errors.array()}
            });
        }else{
            BlogController.delete(req,res,next);
        }
    });
});
// Blog Api End 


module.exports = router;
