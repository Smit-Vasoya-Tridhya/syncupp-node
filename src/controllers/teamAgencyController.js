const catchAsyncError = require("../helpers/catchAsyncError");
const { returnMessage } = require("../utils/utils");
const statusCode = require("../messages/statusCodes.json");
const sendResponse = require("../utils/sendResponse");
const TeamAgencyService = require("../services/teamAgencyService");
const teamAgencyService = new TeamAgencyService();

exports.register = catchAsyncError(async (req, res, next) => {
  await teamAgencyService.register(req.body, req, res);
  sendResponse(
    res,
    true,
    returnMessage("TeamAgency", "emailSent"),
    null,
    statusCode.success
  );
});

exports.verify = catchAsyncError(async (req, res, next) => {
  await teamAgencyService.verify(req.body, req, res);
  sendResponse(
    res,
    true,
    returnMessage("TeamAgency", "created"),
    null,
    statusCode.success
  );
});

exports.login = catchAsyncError(async (req, res, next) => {
  const admin = await teamAgencyService.login(req.body);
  const { password, ...otherData } = admin;
  sendResponse(
    res,
    true,
    returnMessage("auth", "loggedIn"),
    otherData,
    statusCode.success
  );
});
