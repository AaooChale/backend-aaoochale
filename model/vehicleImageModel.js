const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Vehicle = require("../model/vehicleModel");
const VehicleImageSchema = new Schema({
  vehicleimage: String,
  vehicleId: {
    type: mongoose.Schema.ObjectId,
    ref: "Vehicle",
  },
});

const vehicleImage = mongoose.model("vehicleImage", VehicleImageSchema);
module.exports = vehicleImage;
