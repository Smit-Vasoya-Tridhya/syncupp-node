const catchAsyncError = require("../helpers/catchAsyncError");
const { returnMessage } = require("../utils/utils");
const statusCode = require("../messages/statusCodes.json");
const TeamAgencyService = require("../services/teamAgencyService");
const { sendResponse } = require("../utils/sendResponse");
const teamAgencyService = new TeamAgencyService();

// Team Member Register
exports.register = catchAsyncError(async (req, res, next) => {
  await teamAgencyService.register(req.body, req, res);
  sendResponse(
    res,
    true,
    returnMessage("teamAgency", "invitationSent"),
    null,
    statusCode.success
  );
});

// Team Member Verification
exports.verify = catchAsyncError(async (req, res, next) => {
  await teamAgencyService.verify(req.body, req, res);
  sendResponse(
    res,
    true,
    returnMessage("teamAgency", "passwordSet"),
    null,
    statusCode.success
  );
});

// Team Member Login
exports.login = catchAsyncError(async (req, res, next) => {
  const teamMember = await teamAgencyService.login(req.body);
  sendResponse(
    res,
    true,
    returnMessage("auth", "loggedIn"),
    teamMember,
    statusCode.success
  );
});

/// forgotPassword
exports.forgotPassword = catchAsyncError(async (req, res, next) => {
  console.log(req.body);
  const teamMember = await teamAgencyService.forgotPassword(req.body, req, res);

  sendResponse(
    res,
    true,
    returnMessage("teamAgency", "emailSent"),
    teamMember,
    statusCode.success
  );
});

// resetPassword

exports.resetPassword = catchAsyncError(async (req, res, next) => {
  await teamAgencyService.resetPassword(req.body, req, res);

  sendResponse(
    res,
    true,
    returnMessage("teamAgency", "resetPassword"),
    null,
    statusCode.success
  );
});

//Update password

exports.updatePassword = catchAsyncError(async (req, res, next) => {
  await teamAgencyService.updatePassword(req.body, req, res);
  sendResponse(
    res,
    true,
    returnMessage("teamAgency", "passwordUpdated"),
    null,
    statusCode.success
  );
});
