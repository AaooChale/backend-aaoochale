const jwt = require('jsonwebtoken');
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "config.env") });
const AppErr = require(path.join(__dirname, "..", "utils", "AppErr"));
const { promisify } = require("util");
const Helper = require('./../config/Helper');

const AuthenticateToken = async (req, res, next)=>{
    //1) Getting the tocken and check is it exist
  let token;
  if (
    // autharization = "Bearer TOKEN_STRING"
    req?.headers?.authorization &&
    req?.headers?.authorization?.startsWith("Bearer")
  ) {
    token = req?.headers?.authorization?.split(" ")[1];
  } else if (req?.cookies?.jwt) {
    token = req?.cookies?.jwt;
    const cookieToken = req?.cookies?.jwt;
  }
  if (!token) {
    return next(new AppErr("You are not logged  in!!! Please log in to get access.", 200));
  }

  //2) Validate token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  const id = decoded?.id;
  if (!id) return next(new AppErr("JWT Malformed"), 200);
  if(id != 'aaoochale@gmail.com') return next(new AppErr("Invalid Token!"), 200);
  
  req.user = id;
  req.identity = id;
  next();
}

module.exports = AuthenticateToken;