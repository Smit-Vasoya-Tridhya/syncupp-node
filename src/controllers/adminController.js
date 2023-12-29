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
    returnMessage("admin", "loggedIn"),
    admin,
    statusCode.success
  );
});
