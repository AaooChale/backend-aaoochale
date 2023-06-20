const mongoose = require("mongoose");
const path = require("path");
const getISTTime = require(path.join(__dirname, "..", "helpers", "getISTTime"));
const Schema = mongoose.Schema;
const rideSchema = new Schema({
  startLocation: {
    type: String,
    required: [false, "Please Provide pickUpLocation"],
    trim: true,
  },
  endLocation: {
    type: String,
    required: [false, "Please Provide pickUpLocation"],
    trim: true,
  },
  pickUpLocation: {
    type: String,
    required: [false, "Please Provide pickUpLocation"],
    trim: true,
  },
  pickCity: {
    type: String,
    required: [false, "Please Provide pickCity"],
    trim: true,
  },
  pickupLat: {
    type: String,
    required: [false, "Please Provide pickupLat"],
    trim: true,
  },
  pickLong: {
    type: String,
    required: [false, "Please Provide pickLong"],
    trim: true,
  },
  dropLocation: {
    type: String,
    required: [false, "Please Provide dropLocation"],
    trim: true,
  },
  dropoffCity: {
    type: String,
    required: [false, "Please Provide dropoffCity"],
    trim: true,
  },
  dropLat: {
    type: String,
    required: [false, "Please Provide dropLat"],
    trim: true,
  },
  dropLong: {
    type: String,
    required: [false, "Please Provide dropLong"],
    trim: true,
  },
  stopCity: [
    {
      distance: {
        type: Number,
        required: [false, "Please Provide distance"],
        trim: true,
      },
      duration: {
        type: String,
        required: [false, "Please Provide duration"],
        trim: true,
      },
      price: {
        type: Number,
        required: [false, "Please Provide price"],
        trim: true,
      },
      stop_address: {
        type: String,
        required: [false, "Please Provide stop_address"],
        trim: true,
      },
      stop_lat: {
        type: Number,
        required: [false, "Please Provide stop_lat"],
        trim: true,
      },
      stop_lng: {
        type: Number,
        required: [false, "Please Provide stop_lng"],
        trim: true,
      },
    },
  ],
  tripDate: {
    type: Date,
    default: getISTTime(new Date(Date.now())),
    required: [false, "Please Provide tripDate"],
    trim: true,
  },
  tripTime: {
    type: String,
    required: [false, "Please Provide tripTime"],
    trim: true,
  },
  totalDistance: {
    type: String,
    required: [false, "Please Provide totalDistance"],
    trim: true,
  },
  totalTime: {
    type: String,
    required: [false, "Please Provide totalTime"],
    trim: true,
  },
  backSeatEmpty: {
    type: String,
    required: [false, "Please Provide backSeatEmpty"],
    trim: true,
  },
  passengerCount: {
    type: Number,
    required: [false, "Please Provide passengerCount"],
    trim: true,
  },
  totalSeatCount: {
    type: Number,
    required: [false, "Please Provide totalSeatCount"],
    trim: true,
  },
  select_route: {
    type: String,
    required: [false, "Please Provide passengerCount"],
    trim: true,
  },
  rideApproval: {
    type: String,
    enum: ["Yes", "No"],
    required: [false, "Please Provide rideApproval"],
    trim: true,
  },
  tripPrise: {
    type: String,
    required: [false, "Please Provide tripPrise"],
    trim: true,
  },
  extraMessage: {
    type: String,
    required: [false, "Please Provide extraMessage"],
    trim: true,
  },
  rideStatus: {
    type: String,
    required: [false, "Please Provide status"],
    enum: ["Created", "Booked", "Cancel"],
    trim: true,
  },
  vehicleSelect: {
    type: mongoose.Schema.ObjectId,
    ref: "Vehicle",
  },
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
  arrivalTime: {
    type: String,
  },
  destinationTime: {
    type: String,
  },
  createdOn: {
    type: Date,
    default: getISTTime(new Date(Date.now())),
  },
});
const Ride = mongoose.model("Ride", rideSchema);
module.exports = Ride;
