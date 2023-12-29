const catchAsyncError = require("../helpers/catchAsyncError");
const { returnMessage } = require("../utils/utils");
const statusCode = require("../messages/statusCodes.json");
const AuthService = require("../services/authService");
const authService = new AuthService();
const { sendResponse } = require("../utils/sendResponse");
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

exports.agencyGoogelSignUp = catchAsyncError(async (req, res, next) => {
  const agencyGoogelSignUp = await authService.agencySignUp(req.body);
  sendResponse(
    res,
    true,
    returnMessage("auth", "loggedIn"),
    agencyGoogelSignUp,
    statusCode.success
  );
});
