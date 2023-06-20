// THIRD PARTY MODULES
const path = require("path");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const util = require("util");
const logger = require("morgan");
const express = require("express");
const fileUpload = require("express-fileupload");
// CORE MODULES

// SELF MODULES
const UserAuthRouter = require("./route/userAuthRoute");
const vehicleRoute = require("./route/vehicleRoute");
const userPersonalInfoRoute = require("./route/userPersonalInfoRoute");
const RideRoute = require("./route/rideRoute");
const chatRoute = require("./route/chatRoute");
const rideBookedRoute = require("./route/rideBookedRoute");
const reportRoute = require("./route/reportRoute");
const ratingRoute = require("./route/ratingRoute");
const documentRoute = require("./route/documentRoute");
const notificationRoute = require("./route/notificationRoute");
const brandRoute = require("./route/brandRoute");
const modelRoute = require("./route/modelRoute");
const notificationMsgRoute = require("./route/notificationMsgRoute");
const webRoute = require("./route/webRoute");

/// admin route
const adminRoute = require("./route/adminRoute");

const requestBodyLogger = require(path.join(__dirname, "helpers", "winstonLogger"));

const globalErrorHandler = require(path.join(__dirname, "utils", "globalErrorHandler"));
const app = express();

// socket io connection
app.use(express.static(__dirname + "/public"));
// app.use(fileUpload());

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

// connection

///
// image upload cloudinary
app.use(
  fileUpload({
    useTempFiles: true,
  })
);

app.disable("etag");
app.use(logger("dev"));
app.options("*", cors());
app.use(cookieParser());
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("*", (req, res, next) => {
  requestBodyLogger.info(
    `REQUEST BODY = ${util.inspect(req.body, { depth: null })}
     COOKIES = ${util.inspect(req.cookies, {
       depth: null,
     })}
     AUTHORIZATION HEADER = ${util.inspect(req.headers, {
       depth: null,
     })}
    `
  );
  next();
});

// enable cors
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
app.use("/aaoochale/UserAuth", UserAuthRouter);
app.use("/aaoochale/UserAuth/vehicle", vehicleRoute);
app.use("/aaoochale/UserAuth/perinfo", userPersonalInfoRoute);
app.use("/aaoochale/UserAuth/ride", RideRoute);
app.use("/aaoochale/UserAuth/chat", chatRoute);
app.use("/aaoochale/UserAuth/bookedRide", rideBookedRoute);
app.use("/aaoochale/UserAuth/report", reportRoute);
app.use("/aaoochale/UserAuth/rating", ratingRoute);
app.use("/aaoochale/UserAuth/document", documentRoute);
app.use("/aaoochale/UserAuth/notification", notificationRoute);
app.use("/aaoochale/UserAuth/brand", brandRoute);
app.use("/aaoochale/UserAuth/model", modelRoute);
app.use("/aaoochale/UserAuth/notificationMsg", notificationMsgRoute);
app.use("/aaoochale/UserAuth/web", webRoute);

// admin route
app.use("/aaoochale/UserAuth/admin", adminRoute);

// LANDING PAGE
app.use(globalErrorHandler);
app.use("*", (req, res, next) => {
  res.status(404).json({
    message: "API REQUEST NOT FOUND!!",
  });
});
module.exports = app;
