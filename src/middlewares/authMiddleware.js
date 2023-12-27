const ErrorHandler = require("../helpers/errorHandler");
const catchAsyncErrors = require("../helpers/catchAsyncError");
const jwt = require("jsonwebtoken");
const User = require("../models/userSchema");

exports.protect = catchAsyncErrors(async (req, res, next) => {
  const token = req.headers.authorization;

  if (token) {
    var Authorization = token.split(" ")[1];
    const decodedUserData = jwt.verify(
      Authorization,
      process.env.JWT_SECRET_KEY
    );
    const user = await User.findById(decodedUserData.id).select("-password");
    if (!user) return next(new ErrorHandler("User Not Found!", 404));
    req.user = user;
    next();
  } else {
    return next(new ErrorHandler("You are not Authorised!", 401));
  }
});
