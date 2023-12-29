const catchAsyncError = require("../helpers/catchAsyncError");
const { returnMessage } = require("../utils/utils");
const statusCode = require("../messages/statusCodes.json");
const responseMessage = require("../messages/english.json");
const AdminService = require("../services/adminService");
const sendResponse = require("../utils/sendResponse");
const adminService = new AdminService();
const crypto = require("crypto");
const sendEmail = require("../helpers/sendEmail");
const bcrypt = require("bcrypt");
const Admin = require("../models/adminSchema");

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
  const admin = await adminService.forgotPassword(req.body);
  if (!admin) {
    sendResponse(
      res,
      false,
      responseMessage.Admin.emailNotFOund,
      admin,
      statusCode.badRequest
    );
  }
  if (admin) {
    const reset_password_token = crypto.randomBytes(20).toString("hex");
    const reset_password_url = `${req.protocol}://${req.get(
      "host"
    )}/api/v1/passwordReset/${reset_password_token}`;
    const message = `Your password reset token is :- \n\n ${reset_password_url}  \n\n IF you have not requested this mail then , Please ignore`;
    await sendEmail({
      email: req.body.email,
      subject: "Admin Panel Password Recovery",
      message: message,
    });
    admin.reset_password_token = reset_password_token;
    await admin.save();
    sendResponse(
      res,
      true,
      responseMessage.Admin.emailSent,
      admin,
      statusCode.success
    );
  }
});

// resetPassword

exports.resetPassword = catchAsyncError(async (req, res, next) => {
  const admin = await adminService.resetPassword(req.body);
  if (!admin) {
    sendResponse(
      res,
      false,
      responseMessage.Admin.emailNotFOund,
      admin,
      statusCode.badRequest
    );
  } else {
    const hash_password = await bcrypt.hash(req.body.newPassword, 10);
    admin.password = hash_password;
    admin.reset_password_token = "";
    await admin.save();

    sendResponse(
      res,
      true,
      responseMessage.Admin.resetPassword,
      null,
      statusCode.success
    );
  }
});

//Update password

exports.updatePassword = catchAsyncError(async (req, res, next) => {
  const admin = await Admin.findOne({
    email: "admin@yopmail.com",
  });

  if (admin) {
    const is_match = await bcrypt.compare(req.body.oldPassword, admin.password);
    if (!is_match) {
      sendResponse(
        res,
        false,
        responseMessage.Admin.passwordNotMatch,
        null,
        statusCode.badRequest
      );
    }
    const hash_password = await bcrypt.hash(req.body.newPassword, 10);
    admin.password = hash_password;
    await admin.save();
    sendResponse(
      res,
      true,
      responseMessage.Admin.passwordUpdated,
      null,
      statusCode.success
    );
  }
});
