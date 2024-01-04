const catchAsyncError = require("../helpers/catchAsyncError");
const { returnMessage } = require("../utils/utils");
const statusCode = require("../messages/statusCodes.json");
const AdminService = require("../services/adminService");
const { sendResponse } = require("../utils/sendResponse");
const adminService = new AdminService();

exports.login = catchAsyncError(async (req, res, next) => {
  const admin = await adminService.login(req.body);
  sendResponse(
    res,
    true,
    returnMessage("auth", "loggedIn"),
    admin,
    statusCode.success
  );
});

// getAdmin

exports.getAdmin = catchAsyncError(async (req, res, next) => {
  const admin = await adminService.getAdmin(req?.user?._id);
  if (admin) {
    sendResponse(
      res,
      true,
      returnMessage("admin", "adminFetched"),
      admin,
      statusCode.success
    );
  }
});

// forgotPassword
exports.forgotPassword = catchAsyncError(async (req, res, next) => {
  const admin = await adminService.forgotPassword(req.body);

  sendResponse(
    res,
    true,
    returnMessage("admin", "emailSent"),
    admin,
    statusCode.success
  );
});

// resetPassword

exports.resetPassword = catchAsyncError(async (req, res, next) => {
  await adminService.resetPassword(req.body);

  sendResponse(
    res,
    true,
    returnMessage("admin", "resetPassword"),
    null,
    statusCode.success
  );
});

//Update password

exports.changePassword = catchAsyncError(async (req, res, next) => {
  await adminService.changePassword(req.body, req?.user?._id);

  sendResponse(
    res,
    true,
    returnMessage("admin", "passwordUpdated"),
    null,
    statusCode.success
  );
});

//  Get All Team Member

exports.updateAdmin = catchAsyncError(async (req, res, next) => {
  const admin = await adminService.updateAdmin(req.body, req?.user?._id);
  sendResponse(
    res,
    true,
    returnMessage("admin", "updated"),
    admin,
    statusCode.success
  );
});
