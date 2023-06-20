const path = require("path");
const AppErr = require(path.join(__dirname, "AppErr"));
const handleCastErrorDB = (err) => {
  const message = `Ivalid ${err.path}: ${err.value}`;
  return new AppErr(message, 200);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];
  const message = ` Duplicate field value: ${value}. Please enter another value`;
  return new AppErr(message, 200);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid Input data. ${errors.join(". ")}`;
  return new AppErr(message, 200);
};

const handleJWTError = (err) => new AppErr("Invalid token. please login with valid token", 200);

const handleTokenExpiredError = (err) => new AppErr("Token is Expired.please try with valid Token", 200);

const sendErrorDev = (err, res) => {
  if (err.code === 11000) {
    return res.status(200).json({
      status: err.status,
      message: "User already exist!",
      error: err,
      stack: err.stack,
    });
  }
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    //stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  // isOperational: Trusted Error Created By Backend
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    //1) Send Generic Message
    res.status(200).json({
      status: "error",
      message: "something wents very wrong!! Error from Technical side",
    });
  }
};

const globalErrorHandler = function (err, req, res, next) {
  err.status = err.status || "error";
  err.statusCode = err.statusCode || 200;
  err.message = err.message || "Internal Server Error";
  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  }
  if (process.env.NODE_ENV === "production") {
    let error = Object.assign(err);
    if (error.name === "CastError") error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === "ValidationError") error = handleValidationErrorDB(error);
    if (error.name === "JsonWebTokenError") error = handleJWTError(error);
    if (error.name === "TokenExpiredError") error = handleTokenExpiredError(error);
    sendErrorProd(error, res);
  }
};

module.exports = globalErrorHandler;
