const jwt = require("jsonwebtoken");
const Admin = require("../models/adminSchema");
const logger = require("../logger");
const { throwError } = require("../helpers/errorUtil");
const { returnMessage } = require("../utils/utils");
const statusCode = require("../messages/statusCodes.json");
const bcrypt = require("bcrypt");

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

  forgotPassword = async (payload) => {
    const { email } = payload;
    const admin = await Admin.findOne({ email: email }, { password: 0 });
    return admin;
  };

  resetPassword = async (payload) => {
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
    return admin;
  };
  updatePassword = async (payload) => {
    const admin = await Admin.findOne(
      {
        email: "admin@yopmail.com",
      },
      {
        password: 0,
      }
    );

    return admin;
  };
}

module.exports = AdminService;
