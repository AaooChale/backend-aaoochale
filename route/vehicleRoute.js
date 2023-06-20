const express = require("express");
const path = require("path");
const userAuthController = require("../controller/userAuthController");
const vehicleController = require("../controller/vehicleController");
const {check,body,validationResult} = require('express-validator');
const router = express.Router();   
const upload = require("../controller/vehicleController");
const Vehicle = require("../model/vehicleModel");

router.post("/getAllCarsByUserId",
check('id').not().isEmpty().withMessage("The user id is required!!"),
(req,res,next)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        res.status(200).json({
            status:false,
            Message:"Validation Error!!",
            data:{errors:errors.array()}
        });
    }else{
        vehicleController.getAllCarsByUserId(req,res,next);
    }
});


router.post("/getVehicleById",
check('id').not().isEmpty().withMessage("The Vehicle id is required!!"),
(req,res,next)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        res.status(200).json({
            status:false,
            Message:"Validation Error!!",
            data:{errors:errors.array()}
        });
    }else{
        vehicleController.getVehicleById(req,res,next);
    }
});


router.delete("/deleteVehicle",
check('id').not().isEmpty().withMessage("The Vehicle id is required!!"),
(req,res,next)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        res.status(200).json({
            status:false,
            Message:"Validation Error!!",
            data:{errors:errors.array()}
        });
    }else{
        vehicleController.deleteVehicle(req,res,next);
    }
});


router.put("/updateVehicleDetails",
check('id').not().isEmpty().withMessage("The Vehicle id is required!!"),
check('vehicleRegiNumb').not().isEmpty().withMessage("The vehicleRegiNumb field should be unique and cannot be empty!!")
.custom((value, { req }) => {
    return Vehicle.findOne({vehicleRegiNumb: value})
    .then((vehicle) => {
        if(vehicle && vehicle._id != req.body.id){
            return Promise.reject('vehicleRegiNumb has been already taken!!')
        }
    })
    }),
(req,res,next)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        res.status(200).json({
            status:false,
            Message:"Validation Error!!",
            data:{errors:errors.array()}
        });
    }else{
        vehicleController.updateVehicleDetails(req,res,next);
    }
});


router.post("/registerVehicle",
check('vehicleRegiNumb').not().isEmpty().withMessage("The vehicleRegiNumb field should be unique and cannot be empty!!")
.custom(value => {
    return Vehicle.findOne({vehicleRegiNumb: value})
    .then((vehicle) => {
        if(vehicle){
            return Promise.reject('vehicleRegiNumb has been already taken!!')
        }
    })
    }),
check('userId').not().isEmpty().withMessage("The userId is required!!"),
(req,res,next)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        res.status(200).json({
            status:false,
            Message:"Validation Error!!",
            data:{errors:errors.array()}
        });
    }else{
        vehicleController.registerVehicle(req,res,next);
    }
});


router.post("/getVehicleimage",
check('id').not().isEmpty().withMessage("The Vehicle id is required!!"),
(req,res,next)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        res.status(200).json({
            status:false,
            Message:"Validation Error!!",
            data:{errors:errors.array()}
        });
    }else{
        vehicleController.getVehicleimage(req,res,next);
    }
});


router.post("/uploadImage",
check('id').not().isEmpty().withMessage("The Vehicle id is required!!"),
(req,res,next)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        res.status(200).json({
            status:false,
            Message:"Validation Error!!",
            data:{errors:errors.array()}
        });
    }else{
        vehicleController.uploadImage(req,res,next);
    }
});

module.exports = router;
  