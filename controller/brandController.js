const path = require("path");
// const catchAsync = require(path.join(__dirname, "..", "utils", "catchAsync"));
// const AppErr = require(path.join(__dirname, "..", "utils", "AppErr"));
// const User = require("../model/userModel");
const Brand = require("../model/brandSchema");
const getISTTime = require(path.join(__dirname, "..", "helpers", "getISTTime"));
require("dotenv").config();

exports.addBrandVehicle = async (req, res, next) => {
  try {
    const { brandName } = req.body;
    const addBrand = await Brand.create({
      brandName: brandName,
    });

    res.status(200).json({
      status: true,
      message: "Add Vehicle Brand Succussefully",
      addBrand,
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllVehicleBrand = async (req, res, next) => {
  try {
    const users = await Brand.find({deletedOn:null}).sort({brandName:1}).select('-deletedOn').exec();
    res.status(200).json({
      status: true,
      msg: "Get all Vehicle Brand successfully",
      users,
    });
  } catch (err) {
    next(err);
  }
};

exports.updateBrand = async (req,res,next) => {
  try {
    const { brandName,id } = req.body;

    const updateBrand = await Brand.findByIdAndUpdate(
      { _id: id },
      { brandName: brandName },
      { runValidator: true, useFindAndModify: false, new: true }
    );


    res.status(200).json({
      status: true,
      message: "Update Vehicle Brand Succussefully",
      updateBrand,
    });
  } catch (error) {
    next(error);
  }
}

exports.deleteBrand = async (req,res,next) => {
  try{
    const {id} = req.body;
    const deleteBrand = await Brand.findByIdAndUpdate(
      {_id:id},
      {deletedOn:getISTTime(new Date(Date.now()))},
      { runValidator: true, useFindAndModify: false, new: true }
    );
    res.status(200).json({
      status: true,
      message: "Delete Vehicle Brand Succussefully",
      deleteBrand,
    });
  }catch(error){
    next(error);
  }

}
