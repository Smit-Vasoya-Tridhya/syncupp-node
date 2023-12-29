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

// forgotPassword
exports.forgotPassword = catchAsyncError(async (req, res, next) => {
  const admin = await adminService.forgotPassword(req.body);
  if (!admin) {
    sendResponse(
      res,
      false,
      responseMessage.Admin.emailNotFOund,
      admin,
      statusCode.notFound
    );
  }
  if (admin) {
    const getResetPasswordToken = () => {
      // Generate Token
      const resetToken = crypto.randomBytes(20).toString("hex");
      return resetToken;
    };
    const reset_password_token = getResetPasswordToken();
    const reset_password_url = `${req.protocol}://${req.get(
      "host"
    )}/api/v1/passwordreset/${reset_password_token}`;
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
      statusCode.notFound
    );
  } else {
    function hashPassword(password) {
      const saltRounds = 10;
      return bcrypt.hash(password, saltRounds);
    }
    const hash_password = await hashPassword(req.body.newPassword);
    admin.password = hash_password;
    admin.reset_password_token = "";
    await admin.save();

    sendResponse(
      res,
      true,
      responseMessage.Admin.resetPassword,
      admin,
      statusCode.success
    );
  }
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
