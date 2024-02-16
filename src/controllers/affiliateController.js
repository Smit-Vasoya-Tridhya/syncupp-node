const catchAsyncError = require("../helpers/catchAsyncError");
const { returnMessage } = require("../utils/utils");
const statusCode = require("../messages/statusCodes.json");
const AffiliateService = require("../services/affiliateService");
const { sendResponse } = require("../utils/sendResponse");
const affiliateService = new AffiliateService();

// Affiliate Sign Up
exports.signUp = catchAsyncError(async (req, res, next) => {
  const user = await affiliateService.signUp(req.body);
  sendResponse(
    res,
    true,
    returnMessage("auth", "registered"),
    user,
    statusCode.success
  );
});

// Affiliate Log In
exports.login = catchAsyncError(async (req, res, next) => {
  const user = await affiliateService.logIn(req.body);
  sendResponse(
    res,
    true,
    returnMessage("auth", "loggedIn"),
    user,
    statusCode.success
  );
});

// Affiliate Change Password
exports.changePassword = catchAsyncError(async (req, res, next) => {
  await affiliateService.changePassword(req.body, req.user._id);
  sendResponse(
    res,
    true,
    returnMessage("auth", "passwordChanged"),
    null,
    statusCode.success
  );
});

// Affiliate Forgot Password
exports.forgotPassword = catchAsyncError(async (req, res, next) => {
  await affiliateService.forgotPassword(req.body);
  sendResponse(
    res,
    true,
    returnMessage("auth", "resetPasswordMailSent"),
    null,
    statusCode.success
  );
});

// Affiliate Reset Password
exports.resetPassword = catchAsyncError(async (req, res, next) => {
  await affiliateService.resetPassword(req.body);
  sendResponse(
    res,
    true,
    returnMessage("auth", "resetPassword"),
    null,
    statusCode.success
  );
});
