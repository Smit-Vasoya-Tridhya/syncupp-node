const jwt = require("jsonwebtoken");
const Admin = require("../models/adminSchema");
const logger = require("../logger");
const { throwError } = require("../helpers/errorUtil");
const {
  returnMessage,
  forgotPasswordEmailTemplate,
} = require("../utils/utils");
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
      logger.error(`Error while token generate, ${error}`);
      throwError(error?.message, error?.statusCode);
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
        return throwError(returnMessage("auth", "incorrectPassword"));
      return this.tokenGenerator(admin_exist);
    } catch (error) {
      logger.error(`Error while admin login, ${error}`);
      throwError(error?.message, error?.statusCode);
    }
  };

  getAdmins = async (payload) => {
    const admins = await Admin.find({});
    return admins;
  };

  forgotPassword = async (payload) => {
    try {
      const { email } = payload;
      const admin = await Admin.findOne({ email: email }, { password: 0 });
      if (!admin) {
        return throwError(returnMessage("admin", "emailNotFound"));
      }
      const reset_password_token = crypto.randomBytes(20).toString("hex");
      const link = `process.env.CLIENT_RESETPASSWORD_PATH/admin/reset-password/${reset_password_token}`;
      const forgot_email_template = forgotPasswordEmailTemplate(link);

      await sendEmail({
        email: email,
        subject: returnMessage("emailTemplate", "forgotPasswordSubject"),
        message: forgot_email_template,
      });

      const hash_token = crypto
        .createHash("sha256")
        .update(reset_password_token)
        .digest("hex");

      console.log(reset_password_token);
      console.log(hash_token);

      admin.reset_password_token = hash_token;
      await admin.save();
    } catch (error) {
      logger.error(`Error while admin forgotpassword, ${error}`);
      throwError(error?.message, error?.statusCode);
    }
  };

  resetPassword = async (payload) => {
    try {
      const { token, email, newPassword } = payload;
      const admin = await Admin.findOne(
        {
          email: email,
        },
        {
          password: 0,
        }
      );

      if (!admin) {
        return throwError(returnMessage("admin", "emailNotFound"));
      }

      const hash_token = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

      if (hash_token !== admin.reset_password_token) {
        return throwError(returnMessage("admin", "invalidToken"));
      }
      const hash_password = await bcrypt.hash(newPassword, 14);
      admin.password = hash_password;
      admin.reset_password_token = undefined;
      await admin.save();
    } catch (error) {
      logger.error(`Error while admin resetPassword, ${error}`);
      throwError(error?.message, error?.statusCode);
    }
  };

  changePassword = async (payload, teamId) => {
    try {
      const { newPassword, oldPassword } = payload;
      const admin = await Admin.findById(teamId);
      if (!admin) {
        return throwError(returnMessage("admin", "emailNotFound"));
      }

      const is_match = await bcrypt.compare(oldPassword, admin.password);
      if (!is_match) {
        return throwError(returnMessage("admin", "passwordNotMatch"));
      }
      const hash_password = await bcrypt.hash(newPassword, 10);
      admin.password = hash_password;
      await admin.save();
    } catch (error) {
      logger.error(`Error while admin updatePassword, ${error}`);
      throwError(error?.message, error?.statusCode);
    }
  };
}

module.exports = AdminService;
