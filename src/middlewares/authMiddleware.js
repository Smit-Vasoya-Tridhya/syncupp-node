const catchAsyncErrors = require("../helpers/catchAsyncError");
const jwt = require("jsonwebtoken");
const Authentication = require("../models/authenticationSchema");
const { throwError } = require("../helpers/errorUtil");
const { returnMessage } = require("../utils/utils");

exports.protect = catchAsyncErrors(async (req, res, next) => {
  const token = req.headers.authorization || req.headers.token;

  if (token) {
    const Authorization = token.split(" ")[1];
    const decodedUserData = jwt.verify(
      Authorization,
      process.env.JWT_SECRET_KEY
    );
    const user = await Authentication.findById(decodedUserData.id)
      .where("is_deleted")
      .equals("false")
      .select("-password")
      .populate("role", "name")
      .lean();
    if (!user) return throwError(returnMessage("auth", "unAuthorized"), 401);
    req.user = user;
    next();
  } else {
    return throwError(returnMessage("auth", "unAuthorized"), 401);
  }
});

exports.authorizeRole = (requiredRole) =>
  catchAsyncErrors((req, res, next) => {
    if (req?.user?.role?.name !== requiredRole)
      return throwError(returnMessage("auth", "insufficientPermission"), 403);

    next();
  });
