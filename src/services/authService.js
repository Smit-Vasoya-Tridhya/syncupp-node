const jwt = require("jsonwebtoken");
const logger = require("../logger");
const {
  returnMessage,
  validateRequestFields,
  validateEmail,
  passwordValidation,
  forgotPasswordEmailTemplate,
} = require("../utils/utils");
const bcrypt = require("bcrypt");
const { throwError } = require("../helpers/errorUtil");
const Authentication = require("../models/authenticationSchema");
const AgencyService = require("../services/agencyService");
const agencyService = new AgencyService();
const Role_Master = require("../models/masters/roleMasterSchema");
const statusCode = require("../messages/statusCodes.json");
const crypto = require("crypto");
const sendEmail = require("../helpers/sendEmail");

class AuthService {
  tokenGenerator = (payload) => {
    try {
      const token = jwt.sign(
        { id: payload._id, reference: payload.reference_id },
        process.env.JWT_SECRET_KEY,
        {
          expiresIn: process.env.JWT_EXPIRES_IN,
        }
      );
      return { token, user: payload };
    } catch (error) {
      logger.error(`Error while token generate: ${error}`);
      return throwError(error?.message, error?.statusCode);
    }
  };

  passwordVerifier = async (payload) => {
    try {
      return await bcrypt.compare(payload.password, payload.encrypted_password);
    } catch (error) {
      logger.error(`Error while password verification: ${error}`);
      return throwError(error?.message, error?.statusCode);
    }
  };

  passwordEncryption = async (payload) => {
    try {
      return await bcrypt.hash(payload.password, 14);
    } catch (error) {
      logger.error(`Error while password encryption: ${error}`);
      return throwError(error?.message, error?.statusCode);
    }
  };

  agencySignUp = async (payload, files) => {
    try {
      const { first_name, last_name, email, password, contact_number } =
        payload;
      validateRequestFields(payload, [
        "first_name",
        "last_name",
        "email",
        "password",
        "contact_number",
      ]);

      if (!validateEmail(email))
        return throwError(returnMessage("auth", "invalidEmail"));

      if (!passwordValidation(password))
        return throwError(returnMessage("auth", "invalidPassword"));

      const agency_exist = await Authentication.findOne({
        email,
        is_deleted: false,
      });

      if (agency_exist)
        return throwError(returnMessage("agency", "agencyExist"));

      let image_url;
      if (files && files.fieldname === "client_image") {
        image_url = "uploads/" + files?.filename;
      }
      const agency_object = {
        comapny_name: payload?.comapny_name,
        comapny_website: payload?.comapny_website,
        no_of_people: payload?.no_of_people,
        industry: payload?.industry,
      };

      const [agency, encrypted_password, role] = await Promise.all([
        agencyService.agencyRegistration(agency_object),
        this.passwordEncryption({ password }),
        Role_Master.findOne({ name: "agency" }).lean(),
      ]);

      const agency_enroll = await Authentication.create({
        first_name,
        last_name,
        email,
        password: encrypted_password,
        contact_number,
        image_url,
        reference_id: agency?._id,
        remember_me: payload?.remember_me,
        role: role?._id,
        status: "payment_pending",
      });
      agency_enroll.role = role;
      return this.tokenGenerator(agency_enroll);
    } catch (error) {
      logger.error(`Error while agency signup: ${error}`);
      return throwError(error?.message, error?.statusCode);
    }
  };

  googleSign = async (payload) => {
    try {
      const { signupId } = payload;
      if (!signupId)
        return throwError(returnMessage("auth", "googleAuthTokenNotFound"));
      const decoded = jwt.decode(signupId);

      let existing_agency = await Authentication.findOne({
        email: decoded.email,
        is_deleted: false,
      })
        .populate("role")
        .lean();

      if (!existing_agency) {
        const [agency, role] = await Promise.resolve([
          agencyService.agencyRegistration({}),
          Role_Master.findOne({ name: "agency" }).lean(),
        ]);

        const agency_enroll = await Authentication.create({
          first_name: decoded?.given_name,
          last_name: decoded?.family_name,
          email: decoded?.email,
          reference_id: agency?._id,
          remember_me: payload?.remember_me,
          role: role?._id,
          status: "payment_pending",
          is_google_signup: true,
        });
        agency_enroll.role = role;
        return this.tokenGenerator(agency_enroll);
      } else {
        return this.tokenGenerator(existing_agency);
      }
    } catch (error) {
      logger.error("Error while google sign In", error);
      return throwError(error?.message, error?.statusCode);
    }
  };

  facebookSignIn = async (payload) => {
    try {
      const redirect_uri = encodeURIComponent(
        `${process.env.SERVER_URL}/api/v1/auth/facebook-signup`
      );
      const accessTokenUrl =
        "https://graph.facebook.com/v6.0/oauth/access_token?" +
        `client_id=${process.env.FACEBOOK_CLIENT_ID}&` +
        `client_secret=${process.env.FACEBOOK_CLIENT_SECRET}&` +
        `redirect_uri=${redirect_uri}&` +
        `code=${encodeURIComponent(payload)}`;

      const accessToken = await axios
        .get(accessTokenUrl)
        .then((res) => res.data["access_token"]);

      const data = await axios
        .get(
          `https://graph.facebook.com/me?access_token=${encodeURIComponent(
            accessToken
          )}&fields=id,name,email,first_name,last_name`
        )
        .then((res) => res.data);

      if (!data?.email) return throwError(returnMessage("default", "default"));

      let existing_agency = await Authentication.findOne({
        email: data?.email,
        is_deleted: false,
      })
        .populate("role")
        .lean();

      if (!existing_agency) {
        const [agency, role] = await Promise.resolve([
          agencyService.agencyRegistration({}),
          Role_Master.findOne({ name: "agency" }).lean(),
        ]);

        const agency_enroll = await Authentication.create({
          first_name: data?.first_name,
          last_name: data?.last_name,
          email: data?.email,
          reference_id: agency?._id,
          role: role?._id,
          status: "payment_pending",
          is_facebook_signup: true,
        });
        agency_enroll.role = role;
        return this.tokenGenerator(agency_enroll);
      } else {
        return this.tokenGenerator(existing_agency);
      }
    } catch (error) {
      logger.error(`Error while facebook signup:${error.message}`);
      throwError(error?.message, error?.statusCode);
    }
  };

  login = async (payload) => {
    try {
      const { email, password } = payload;
      validateRequestFields(payload, ["email", "password"]);

      const existing_Data = await Authentication.findOne({
        email,
        is_deleted: false,
      })
        .populate("role")
        .lean();

      if (!existing_Data)
        return throwError(
          returnMessage("auth", "dataNotFound"),
          statusCode.notFound
        );

      if (
        !(await this.passwordVerifier({
          password,
          encrypted_password: existing_Data?.password,
        }))
      )
        return throwError(returnMessage("auth", "incorrectPassword"));

      if (
        existing_Data?.role?.name == "agency" &&
        existing_Data?.status == "agency_inactive"
      )
        return throwError(returnMessage("agency", "agencyInactive"));

      return this.tokenGenerator(existing_Data);
    } catch (error) {
      logger.error(`Error while login: ${error.message}`);
      return throwError(error?.message, error?.statusCode);
    }
  };

  resetPasswordTokenGenerator = () => {
    try {
      const token = crypto.randomBytes(32).toString("hex");
      const hash_token = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");
      return { token, hash_token };
    } catch (error) {
      logger.error(`Error while generating reset password token: ${error}`);
      return throwError(error?.message, error?.statusCode);
    }
  };

  forgotPassword = async (payload) => {
    try {
      const { email } = payload;
      if (!email) return throwError(returnMessage("auth", "emailRequired"));

      const data_exist = await Authentication.findOne({
        email,
        is_deleted: false,
        is_facebook_signup: false,
        is_google_signup: false,
      }).lean();

      if (!data_exist)
        return throwError(
          returnMessage("auth", "emailNotFound"),
          statusCode.notFound
        );

      const { token, hash_token } = this.resetPasswordTokenGenerator();
      const encode = encodeURIComponent(email);
      const link = `${process.env.RESET_PASSWORD_URL}?token=${token}&email=${encode}`;
      const forgot_email_template = forgotPasswordEmailTemplate(link);

      sendEmail({
        email,
        subject: returnMessage("emailTemplate", "forgotPasswordSubject"),
        message: forgot_email_template,
      });
      await Authentication.findByIdAndUpdate(
        data_exist?._id,
        { reset_password_token: hash_token },
        { new: true }
      );
      return true;
    } catch (error) {
      logger.error(`Error with forget password: ${error}`);
      return throwError(error?.message, error?.statusCode);
    }
  };

  resetPassword = async (payload) => {
    try {
      const { email, password, token } = payload;
      validateRequestFields(payload, ["email", "password", "token"]);
      if (!passwordValidation(password))
        return throwError(returnMessage("auth", "invalidPassword"));

      const reset_password_token = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

      const data = await Authentication.findOne({
        email,
        reset_password_token,
        is_deleted: false,
        is_facebook_signup: false,
        is_google_signup: false,
      });

      if (!data) return throwError(returnMessage("auth", "invalidToken"));

      const hased_password = await this.passwordEncryption({ password });
      await Authentication.findByIdAndUpdate(
        data?._id,
        {
          password: hased_password,
          reset_password_token: undefined,
        },
        { new: true }
      );
      return true;
    } catch (error) {
      logger.error(`Error while resetting password: ${error}`);
      return throwError(error?.message, error?.statusCode);
    }
  };

  changePassword = async (payload, user_id) => {
    try {
      const { old_password, new_password } = payload;

      if (!old_password || !new_password)
        return throwError(returnMessage("auth", "passwordRequired"));

      const user = await Authentication.findById(user_id);
      const old_password_valid = await this.passwordVerifier({
        password: old_password,
        encrypted_password: user?.password,
      });

      if (!old_password_valid)
        return throwError(returnMessage("auth", "incorrectOldPassword"));

      const hash_password = await this.passwordEncryption({
        password: new_password,
      });

      user.reset_password_token = undefined;
      user.password = hash_password;
      await user.save();

      return true;
    } catch (error) {
      logger.error(`Error while changing password: ${error}`);
      return throwError(error?.message, error?.statusCode);
    }
  };
}

module.exports = AuthService;
