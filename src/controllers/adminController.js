const catchAsyncError = require("../helpers/catchAsyncError");
const { returnMessage } = require("../utils/utils");
const statusCode = require("../messages/statusCodes.json");
const AdminService = require("../services/adminService");
const sendResponse = require("../utils/sendResponse");
const adminService = new AdminService();

exports.login = catchAsyncError(async (req, res, next) => {
  const admin = await adminService.login(req.body);
  sendResponse(
    res,
    true,
    returnMessage("admin", "loggedIn"),
    admin,
    statusCode.success
  );
});

// getUsers

exports.getAdmins = catchAsyncError(async (req, res, next) => {
  const admin = await adminService.getAdmins();
  if (admin) {
    sendResponse(
      res,
      true,
      `Users fetched successfully `,
      admin,
      statusCode.success
    );
  }
});

// forgotPassword
exports.forgotPassword = catchAsyncError(async (req, res, next) => {
  const admin = await adminService.forgotPassword(req.body, req, res);

  sendResponse(
    res,
    true,
    returnMessage("Admin", "emailSent"),
    admin,
    statusCode.success
  );
});

// resetPassword

exports.resetPassword = catchAsyncError(async (req, res, next) => {
  await adminService.resetPassword(req.body, req, res);

  sendResponse(
    res,
    true,
    returnMessage("Admin", "resetPassword"),
    null,
    statusCode.success
  );
});

//Update password

exports.updatePassword = catchAsyncError(async (req, res, next) => {
  await adminService.updatePassword(req.body, req, res);

  sendResponse(
    res,
    true,
    returnMessage("Admin", "passwordUpdated"),
    null,
    statusCode.success
  );
});
