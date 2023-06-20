const express = require("express");
const router = express.Router();
const modelController = require("../controller/modelController");
const { check,body, validationResult } = require('express-validator');


router.post("/addModelVehicle", 
check('modalName').not().isEmpty().withMessage("The modalName field cannot be empty!!"),
check('brandId').not().isEmpty().withMessage("The brandId field cannot be empty!!"),
(req, res,next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(200).json({
            status: false,
            message: "validation Error",
            data: { errors: errors.array() },
        });
    }else{
        modelController.addModelVehicle(req,res,next);
    }
});

router.post("/getAllVehicleModel", 
check('brandId').not().isEmpty().withMessage("The brandId field cannot be empty!!"),
(req, res,next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(200).json({
            status: false,
            message: "validation Error",
            data: { errors: errors.array() },
        });
    }else{
        modelController.getAllVehicleModel(req,res,next);  
    }
});

router.post("/updateModel", 
check('id').not().isEmpty().withMessage("The id field cannot be empty!!"),
check('modalName').not().isEmpty().withMessage("The modalName field cannot be empty!!"),
check('brandId').not().isEmpty().withMessage("The brandId field cannot be empty!!"),
(req, res,next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(200).json({
            status: false,
            message: "validation Error",
            data: { errors: errors.array() },
        });
    }else{
        modelController.updateModel(req,res,next);
    }
});


router.post("/deleteModel", 
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
        modelController.deleteModel(req,res,next);
    }
});

module.exports = router;
