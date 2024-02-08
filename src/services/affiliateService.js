const jwt = require("jsonwebtoken");
const Affiliate = require("../models/affiliateSchema");
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

class AffiliateService {
  // Generate Token
  tokenGenerator = (payload) => {
    try {
      const expiresIn = payload?.rememberMe
        ? process.env.JWT_REMEMBER_EXPIRE
        : process.env.JWT_EXPIRES_IN;
      const token = jwt.sign(
        { id: payload._id },
        process.env.JWT_AFFILIATE_SECRET_KEY,
        {
          expiresIn,
        }
      );
      return { token, user: payload };
    } catch (error) {
      logger.error(`Error while token generate, ${error}`);
      throwError(error?.message, error?.statusCode);
    }
  };

  // Affiliate Sign Up
  signUp = async (payload) => {
    try {
      const { email, password, name, company_name } = payload;

      const user = await Affiliate.findOne({ email: email });
      if (user) {
        return throwError(returnMessage("affiliate", "emailExist"));
      }

      const hash_password = await bcrypt.hash(password, 14);

      let newUser = await Affiliate.create({
        email,
        password: hash_password,
        name,
        company_name,
      });
      newUser.save();

      newUser = newUser.toObject();
      delete newUser?.password;
      delete newUser?.remember_me;
      delete newUser?.is_deleted;
      return this.tokenGenerator({
        ...newUser,
        rememberMe: payload?.rememberMe,
      });
    } catch (error) {
      logger.error(`Error while affiliate signup: ${error}`);
      return throwError(error?.message, error?.statusCode);
    }
  };

  // Affiliate Login In
  logIn = async (payload) => {
    try {
      const { email, password } = payload;

      if (!email || !password) {
        return throwError(returnMessage("auth", "emailPassNotFound"));
      }

      const user = await Affiliate.findOne(
        { email, is_deleted: false },
        { is_deleted: 0, remember_me: 0 }
      );

      if (!user) {
        return throwError(returnMessage("affiliate", "incorrectPassword"));
      }
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return throwError(returnMessage("affiliate", "incorrectPassword"));
      }
      delete user._doc?.password;
      return this.tokenGenerator({
        ...user._doc,
        rememberMe: payload?.rememberMe,
      });
    } catch (error) {
      logger.error(`Error while affiliate signup: ${error}`);
      return throwError(error?.message, error?.statusCode);
    }
  };

  // Affiliate Change Password
  changePassword = async (payload, user_id) => {
    try {
      const { new_password, old_password } = payload;
      if (new_password === old_password) {
        return throwError(returnMessage("auth", "oldAndNewPasswordSame"));
      }
      const user = await Affiliate.findById({ _id: user_id });
      if (!user) {
        return throwError(returnMessage("auth", "invalidEmail"));
      }

      const is_match = await bcrypt.compare(old_password, user.password);
      if (!is_match) {
        return throwError(returnMessage("auth", "passwordNotMatch"));
      }
      const hash_password = await bcrypt.hash(new_password, 14);
      user.password = hash_password;
      await user.save();
    } catch (error) {
      logger.error(`Error while Affiliate changePassword, ${error}`);
      throwError(error?.message, error?.statusCode);
    }
  };

  // Affiliate Forgot Password
  forgotPassword = async (payload) => {
    try {
      const { email } = payload;
      const user = await Affiliate.findOne({ email: email }, { password: 0 });
      if (!user) {
        return throwError(returnMessage("auth", "invalidEmail"));
      }
      const reset_password_token = crypto.randomBytes(32).toString("hex");
      const encode = encodeURIComponent(email);
      const link = `${process.env.ADMIN_RESET_PASSWORD_URL}?token=${reset_password_token}&email=${encode}`;
      const forgot_email_template = forgotPasswordEmailTemplate(
        link,
        user?.first_name + " " + user?.last_name || user?.name
      );

      await sendEmail({
        email: email,
        subject: returnMessage("emailTemplate", "forgotPasswordSubject"),
        message: forgot_email_template,
      });

      const hash_token = crypto
        .createHash("sha256")
        .update(reset_password_token)
        .digest("hex");
      user.reset_password_token = hash_token;
      await user.save();
      return;
    } catch (error) {
      logger.error(`Error while affiliate forgotpassword, ${error}`);
      throwError(error?.message, error?.statusCode);
    }
  };

  // Affiliate Reset Password

  resetPassword = async (payload) => {
    try {
      const { token, email, new_password } = payload;
      const hash_token = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");
      const user = await Affiliate.findOne({
        email: email,
        reset_password_token: hash_token,
        is_deleted: false,
      });

      if (!user) {
        return throwError(returnMessage("auth", "invalidToken"));
      }

      const hash_password = await bcrypt.hash(new_password, 14);
      user.password = hash_password;
      user.reset_password_token = null;
      await user.save();
      return;
    } catch (error) {
      logger.error(`Error while affiliate resetPassword, ${error}`);
      throwError(error?.message, error?.statusCode);
    }
  };
}

module.exports = AffiliateService;
