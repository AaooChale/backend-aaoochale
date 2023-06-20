const path = require("path");
const catchAsync = require(path.join(__dirname, "..", "utils", "catchAsync"));
const AppErr = require(path.join(__dirname, "..", "utils", "AppErr"));
const User = require(path.join(__dirname, "..", "model", "userModel"));
const aws = require("aws-sdk");
const multerS3 = require("multer-s3");
const multer = require("multer");
require("dotenv").config();
const Vehicle = require("../model/vehicleModel");
const vehicleImage = require("../model/vehicleImageModel");
const Helper = require("../config/Helper");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: "dyetuvbqa",
  api_key: "931785857465896",
  api_secret: "hEnL1zZDYVp65zn-S3ZEy66B0bs",
  secure: true,
});
exports.registerVehicle = async (req, res, next) => {
  try {
    let { vehicleRegiNumb, carBrand, carModel, carType, carColor, manufacturYear, seatCount, colorCode, userId } =
      req.body;
    const vehicle = await Vehicle.create({
      vehicleRegiNumb: vehicleRegiNumb,
      seatCount: seatCount,
      carBrand: carBrand,
      carModel: carModel,
      carType: carType,
      carColor: carColor,
      colorCode: colorCode,
      manufacturYear: manufacturYear,
      userId: userId,
    });
    res.status(200).json({
      status: true,
      message: "Vehicle Register Succussefully",
      data: {
        vehicle,
      },
    });
  } catch (error) {
    next(error);
  }
};
exports.getAllCarsByUserId = async (req, res, next) => {
  const { id } = req.body;
  if (!id) return next(new AppErr("Pelase Provide Vehicle Id"), 200);
  try {
    const getAllCars = await Vehicle.find({ userId: id }).sort({createdOn:-1});
    res.status(200).json({
      status: true,
      message: "Get Vehicle successfully By user Id",
      getAllCars,
    });
  } catch (error) {
    next(error);
  }
};

exports.getVehicleById = async (req, res, next) => {
  try {
    const { id } = req.body;
    if (!id || !id.trim()) {
      return res.status(200).json({
        message: "No Vehicle Id Provided",
        success: false,
      });
    } else {
      const getCar = await Vehicle.findOne({ _id: id });
      var cars = [];
      cars.push({...getCar._doc,vehicleimage:(getCar.vehicleimage != null) ? getCar.vehicleimage : '' });
      if (getCar != null) {
        return res.status(200).json({
          message: "Vehicle details found",
          success: true,
          getCar:cars,
        });
      } else {
      return res.status(200).json({
        message: "No Vehicle details found",
        success: false,
        getCar,
      });
    }
  }
  } catch (error) {
    return res.status(200).json({
      message: "Something went wrong",
      success: false,
    });
  }
};
exports.getVehicleimage = async (req, res, next) => {
  const { id } = req.body;
  if (!id) return next(new AppErr("Pelase Provide Vehicle Id"), 200);
  try {
    const vehiclePic = await Vehicle.findOne({ vehicleId: id });
    res.status(200).json({
      status: true,
      message: "Get Vehicle Image successfully By Vehicle Id",
      vehiclePic,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteVehicle = catchAsync(async (req, res, next) => {
  const { id } = req.body;
  if (!id) return next(new AppErr("Pelase Provide Vehicle Id"), 200);
  const vehicleDelete = await Vehicle.findByIdAndDelete({ _id: id });
  res.status(200).json({
    status: true,
    message: "Delete Vehicle Successfully By Vehicle Id",
    vehicleDelete,
  });
});


exports.updateVehicleDetails = catchAsync(async (req, res, next) => {
  const { id, vehicleRegiNumb, carBrand, carModel, carType, carColor, manufacturYear, seatCount, colorCode } = req.body;
  if (!id) return next(new AppErr("Pelase Provide User Id"), 200);
  const user = await Vehicle.findByIdAndUpdate(
    { _id: id },
    { ...req.body },
    { runValidator: true, useFindAndModify: false, new: true }
  );

  await user.save();
  res.status(200).json({
    status: true,
    data: {
      message: "Update Vehicle details Successfully",
      user,
    },
  });
});

exports.uploadImage = async (req, res) => {
  const { id } = req.body;
  const file = req.files.vehicleimage;
  if (!id) return next(new AppErr("Pelase Provide vehicle Id"), 200);
  Helper.imageUploadS3(file.tempFilePath,'vehicleImage/'+id)
  .then(async (location)=>{
    const vehicle = await Vehicle.findOne({ _id: id });
    vehicle.vehicleimage = location;
    await vehicle.save();
    res.status(200).json({
      status: true,
      data: {
        message: "Upload Vehicle Image Successfully",
      },
    });
  }).catch((err)=>{
    res.status(200).json({
      status:false,
      message:"Some Error Occured!!",
      data:{errors:err}
    });
  });
};

