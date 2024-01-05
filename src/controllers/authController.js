const catchAsyncError = require("../helpers/catchAsyncError");
const { returnMessage } = require("../utils/utils");
const statusCode = require("../messages/statusCodes.json");
const AuthService = require("../services/authService");
const authService = new AuthService();
const { sendResponse } = require("../utils/sendResponse");
const { throwError } = require("../helpers/errorUtil");

// this function is used only for the Agency Sign-up

exports.agencySignUp = catchAsyncError(async (req, res, next) => {
  const files = req?.files || undefined;
  const agency = await authService.agencySignUp(req.body, files);
  sendResponse(
    res,
    true,
    returnMessage("agency", "agencyRegistered"),
    agency,
    statusCode.success
  );
});

exports.agencyGoogleSignUp = catchAsyncError(async (req, res, next) => {
  const agencyGoogleSignUp = await authService.googleSign(req.body);
  return sendResponse(
    res,
    true,
    returnMessage("auth", "loggedIn"),
    agencyGoogleSignUp,
    statusCode.success
  );
});

exports.agencyFacebookSignUp = catchAsyncError(async (req, res, next) => {
  const agencyFacebookSignUp = await authService.facebookSignIn(req.body);
  return sendResponse(
    res,
    true,
    returnMessage("auth", "loggedIn"),
    agencyFacebookSignUp,
    statusCode.success
  );
});

exports.login = catchAsyncError(async (req, res, next) => {
  const loggedIn = await authService.login(req.body);
  return sendResponse(
    res,
    true,
    returnMessage("auth", "loggedIn"),
    loggedIn,
    statusCode.success
  );
});

exports.forgotPassword = catchAsyncError(async (req, res, next) => {
  await authService.forgotPassword(req.body);
  return sendResponse(
    res,
    true,
    returnMessage("auth", "resetPasswordMailSent"),
    {},
    statusCode.success
  );
});

exports.resetPassword = catchAsyncError(async (req, res, next) => {
  await authService.resetPassword(req.body);
  return sendResponse(
    res,
    true,
    returnMessage("auth", "passwordReset"),
    {},
    statusCode.success
  );
});

exports.changePassword = catchAsyncError(async (req, res, next) => {
  await authService.changePassword(req.body, req.user._id);
  return sendResponse(
    res,
    true,
    returnMessage("auth", "passwordChanged"),
    {},
    statusCode.success
  );
});
