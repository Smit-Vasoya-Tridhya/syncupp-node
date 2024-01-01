const jwt = require("jsonwebtoken");
const Admin = require("../models/adminSchema");
const logger = require("../logger");
const { throwError } = require("../helpers/errorUtil");
const { returnMessage } = require("../utils/utils");
const statusCode = require("../messages/statusCodes.json");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const sendEmail = require("../helpers/sendEmail");

class AdminService {
  tokenGenerator = (payload) => {
    try {
      const token = jwt.sign(
        { id: payload._id },
        process.env.JWT_ADMIN_SECRET_KEY,
        {
          expiresIn: process.env.JWT_EXPIRES_IN,
        }
      );
      return { token, user: payload };
    } catch (error) {
      logger.error("Error while token generate", error);
    }
  };

  login = async (payload) => {
    try {
      const { email, password } = payload;

      if (!email || !password)
        return throwError(
          returnMessage("auth", "emailPassNotFound"),
          statusCode.badRequest
        );

      const admin_exist = await Admin.findOne({ email }).lean();

      if (!admin_exist)
        return throwError(
          returnMessage("admin", "adminNotFound"),
          statusCode.notFound
        );

      const correct_password = await bcrypt.compare(
        password,
        admin_exist?.password
      );
      if (!correct_password)
        return throwError(
          returnMessage("auth", "incorrectPassword"),
          statusCode.badRequest
        );

      return this.tokenGenerator(admin_exist);
    } catch (error) {
      logger.error(`Error while admin login, ${error}`);
      throwError(error?.message, error?.status);
    }
  };

  getAdmins = async (payload) => {
    const admins = await Admin.find({});
    return admins;
  };

  forgotPassword = async (payload, req, res) => {
    const { email } = payload;
    const admin = await Admin.findOne({ email: email }, { password: 0 });
    if (!admin) {
      return throwError(returnMessage("Admin", "emailNotFound"));
    }
    if (admin) {
      const reset_password_token = crypto.randomBytes(20).toString("hex");
      const reset_password_url = `${req.protocol}://${req.get(
        "host"
      )}/api/v1/password-reset/${reset_password_token}`;
      const message = `Your password reset token is :- \n\n ${reset_password_url}  \n\n IF you have not requested this mail then , Please ignore`;
      await sendEmail({
        email: req.body.email,
        subject: "Admin Panel Password Recovery",
        message: message,
      });
      admin.reset_password_token = reset_password_token;
      await admin.save();
    }
  };

  resetPassword = async (payload, req, res) => {
    const { token, email } = payload;
    const admin = await Admin.findOne(
      {
        email: email,
        reset_password_token: token,
      },
      {
        password: 0,
      }
    );
    if (!admin) {
      return throwError(returnMessage("Admin", "emailNotFound"));
    } else {
      const hash_password = await bcrypt.hash(req.body.newPassword, 10);
      admin.password = hash_password;
      admin.reset_password_token = "";
      await admin.save();
    }
  };
  updatePassword = async (payload, req, res) => {
    const admin = await Admin.findOne({
      email: "admin@yopmail.com",
    });

    if (admin) {
      const is_match = await bcrypt.compare(
        req.body.oldPassword,
        admin.password
      );
      if (!is_match) {
        return throwError(returnMessage("Admin", "passwordNotMatch"));
      }
      const hash_password = await bcrypt.hash(req.body.newPassword, 10);
      admin.password = hash_password;
      await admin.save();
    }
  };
}

module.exports = AdminService;
