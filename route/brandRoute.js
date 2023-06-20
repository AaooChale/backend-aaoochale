const express = require("express");
const router = express.Router();
const brandController = require("../controller/brandController");
const { check,body, validationResult } = require('express-validator');

router.post("/addBrandVehicle", 
check('brandName').not().isEmpty().withMessage("The brandName field cannot be empty!!"),
(req, res,next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(200).json({
            status: false,
            message: "validation Error",
            data: { errors: errors.array() },
        });
    }else{
        brandController.addBrandVehicle(req,res,next);
    }
});
router.post("/getAllVehicleBrand", brandController.getAllVehicleBrand);

router.post("/updateBrand", 
check('id').not().isEmpty().withMessage("The id field cannot be empty!!"),
check('brandName').not().isEmpty().withMessage("The brandName field cannot be empty!!"),
(req, res,next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(200).json({
            status: false,
            message: "validation Error",
            data: { errors: errors.array() },
        });
    }else{
        brandController.updateBrand(req,res,next);
    }
});
router.post("/deleteBrand", 
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
        brandController.deleteBrand(req,res,next);
    }
});

module.exports = router;
