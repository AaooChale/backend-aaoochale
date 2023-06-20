const Model = require("../model/modelSchema");
const Brand = require("../model/brandSchema");
const path = require("path");
const getISTTime = require(path.join(__dirname, "..", "helpers", "getISTTime"));
require("dotenv").config();
exports.addModelVehicle = async (req, res, next) => {
  try {
    const { modalName, brandId } = req.body;
    if (modalName == "" || modalName == undefined || modalName == null) {
      res.status(200).json({
        status: false,
        msg: "Please provide modalName",
      });
    }
    if (brandId == "" || brandId == undefined || brandId == null) {
      res.status(200).json({
        status: false,
        msg: "Please provide brandId",
      });
    }
    const addModel = await Model.create({
      modalName: modalName,
      brandId: brandId,
    });
    res.status(200).json({
      status: true,
      message: "Add Vehicle Model Succussefully",
      addModel,
    });
  } catch (error) {
    next(error);
  }
};
exports.getAllVehicleModel = async (req, res, next) => {
  try {
    const { brandId } = req.body;
    if (brandId == "" || brandId == undefined || brandId == null) {
      res.status(200).json({
        status: false,
        msg: "Please provide brandId",
      });
    } else {
      const Modal = await Model.find({
        brandId: brandId,deletedOn:null
      }).sort({modalName:1}).select("-deletedOn");
      res.status(200).json({
        status: true,
        msg: "Get all Vehicle Model successfully",
        Modal,
      });
    }
  } catch (err) {
    next(err);
  }
};


exports.updateModel = async (req,res,next) =>{
  try {
    const { modalName, brandId,id } = req.body;
    if (modalName == "" || modalName == undefined || modalName == null) {
      res.status(200).json({
        status: false,
        msg: "Please provide modalName",
      });
    }
    if (brandId == "" || brandId == undefined || brandId == null) {
      res.status(200).json({
        status: false,
        msg: "Please provide brandId",
      });
    }
    if (id == "" || id == undefined || id == null) {
      res.status(200).json({
        status: false,
        msg: "Please provide id",
      });
    }
    const updateModel = await Model.findByIdAndUpdate(
      { _id: id },
      { modalName: modalName,brandId: brandId },
      { runValidator: true, useFindAndModify: false, new: true }
    );
    res.status(200).json({
      status: true,
      message: "Update Vehicle Model Succussefully",
      updateModel,
    });
  } catch (error) {
    next(error);
  }
}

exports.deleteModel = async (req,res,next)=>{
  try{
    const {id} = req.body;
    const deleteModel = await Model.findByIdAndUpdate(
      {_id:id},
      {deletedOn:getISTTime(new Date(Date.now()))},
      { runValidator: true, useFindAndModify: false, new: true }
    );
    res.status(200).json({
      status: true,
      message: "Deleted Vehicle Model Succussefully",
      deleteModel,
    });
  }catch (error){
    next(error);
  }
}
  