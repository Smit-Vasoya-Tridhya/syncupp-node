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
const axios = require("axios");
require("dotenv").config();
const Country_Master = require("../models/masters/countryMasterSchema");
const City_Master = require("../models/masters/cityMasterSchema");
const State_Master = require("../models/masters/stateMasterSchema");
class AuthService {
  tokenGenerator = (payload) => {
    try {
      const expiresIn = payload?.rememberMe
        ? process.env.JWT_REMEMBER_EXPIRE
        : process.env.JWT_EXPIRES_IN;

      const token = jwt.sign(
        { id: payload._id, reference: payload.reference_id },
        process.env.JWT_SECRET_KEY,
        {
          expiresIn,
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

      // if (isNaN(contact_number))
      //   return throwError(returnMessage("auth", "invalidContactNumber"));

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
        company_name: payload?.company_name,
        company_website: payload?.company_website,
        no_of_people: payload?.no_of_people,
        industry: payload?.industry,
      };

      const [agency, encrypted_password, role] = await Promise.all([
        agencyService.agencyRegistration(agency_object),
        this.passwordEncryption({ password }),
        Role_Master.findOne({ name: "agency" }).select("name").lean(),
      ]);

      let agency_enroll = await Authentication.create({
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
      agency_enroll = agency_enroll.toObject();
      agency_enroll.role = role;
      delete agency_enroll?.password;
      delete agency_enroll?.is_facebook_signup;
      delete agency_enroll?.is_google_signup;
      return this.tokenGenerator({
        ...agency_enroll,
        rememberMe: payload?.rememberMe,
      });
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
        .populate("role", "name")
        .lean();

      if (!existing_agency) {
        const [agency, role] = await Promise.all([
          agencyService.agencyRegistration({}),
          Role_Master.findOne({ name: "agency" }).select("name").lean(),
        ]);

        let agency_enroll = await Authentication.create({
          first_name: decoded?.given_name,
          last_name: decoded?.family_name,
          email: decoded?.email,
          reference_id: agency?._id,
          role: role?._id,
          status: "payment_pending",
          is_google_signup: true,
        });
        agency_enroll = agency_enroll.toObject();
        agency_enroll.role = role;
        return this.tokenGenerator({
          ...agency_enroll,
        });
      } else {
        return this.tokenGenerator({
          ...existing_agency,
        });
      }
    } catch (error) {
      logger.error("Error while google sign In", error);
      return throwError(error?.message, error?.statusCode);
    }
  };

  facebookSignIn = async (payload) => {
    try {
      const { access_token } = payload;
      if (!access_token || access_token === "")
        return throwError(returnMessage("auth", "facebookAuthTokenNotFound"));

      const data = await axios
        .get(
          `https://graph.facebook.com/me?access_token=${access_token}&fields=id,name,email,first_name,last_name`
        )
        .then((res) => res.data);

      if (!data?.email) return throwError(returnMessage("default", "default"));

      let existing_agency = await Authentication.findOne({
        email: data?.email,
        is_deleted: false,
      })
        .populate("role", "name")
        .lean();

      if (!existing_agency) {
        const [agency, role] = await Promise.all([
          agencyService.agencyRegistration({}),
          Role_Master.findOne({ name: "agency" }).select("name").lean(),
        ]);

        let agency_enroll = await Authentication.create({
          first_name: data?.first_name,
          last_name: data?.last_name,
          email: data?.email,
          reference_id: agency?._id,
          role: role?._id,
          status: "payment_pending",
          is_facebook_signup: true,
        });
        agency_enroll = agency_enroll.toObject();
        agency_enroll.role = role;
        return this.tokenGenerator({
          ...agency_enroll,
        });
      } else {
        return this.tokenGenerator({
          ...existing_agency,
        });
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
        .populate("role", "name")
        .lean();

      if (!existing_Data)
        return throwError(
          returnMessage("auth", "dataNotFound"),
          statusCode.notFound
        );

      if (!existing_Data?.password)
        return throwError(returnMessage("auth", "emailPassNotFound"));

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

      delete existing_Data?.is_facebook_signup;
      delete existing_Data?.is_google_signup;
      delete existing_Data?.password;
      return this.tokenGenerator({
        ...existing_Data,
        rememberMe: payload?.rememberMe,
      });
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

      await sendEmail({
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

      if (hased_password == user?.password)
        return throwError(returnMessage("auth", "oldAndNewPasswordSame"));

      await Authentication.findByIdAndUpdate(data?._id, {
        password: hased_password,
        reset_password_token: null,
      });
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

      if (hash_password === user.password)
        return throwError(returnMessage("auth", "oldAndNewPasswordSame"));

      user.reset_password_token = null;
      user.password = hash_password;
      await user.save();

      return true;
    } catch (error) {
      logger.error(`Error while changing password: ${error}`);
      return throwError(error?.message, error?.statusCode);
    }
  };

  countryList = async (payload) => {
    try {
      const query_obj = {};

      if (payload.search && payload.search !== "") {
        query_obj["$or"] = [
          {
            name: { $regex: payload.search, $options: "i" },
          },
        ];
      }

      return await Country_Master.find(query_obj).select("name").lean();
    } catch (error) {
      logger.error(`Error while fectching countries list: ${error}`);
      return throwError(error?.message, error?.statusCode);
    }
  };

  statesList = async (country_id, payload) => {
    try {
      const query_obj = { country: country_id };

      if (payload.search && payload.search !== "") {
        query_obj["$or"] = [
          {
            name: { $regex: payload.search, $options: "i" },
          },
        ];
      }
      return await State_Master.find(query_obj).select("name").lean();
    } catch (error) {
      logger.error(`Error while fectching states: ${error}`);
      return throwError(error?.message, error?.statusCode);
    }
  };

  citiesList = async (state_id, payload) => {
    try {
      const query_obj = { state: state_id };

      if (payload.search && payload.search !== "") {
        query_obj["$or"] = [
          {
            name: { $regex: payload.search, $options: "i" },
          },
        ];
      }

      return await City_Master.find(query_obj).select("name").lean();
    } catch (error) {
      logger.error(`Error while fectching cities list: ${error}`);
      return throwError(error?.message, error?.statusCode);
    }
  };

  // set password is required
  passwordSetRequired = async (payload) => {
    try {
      if (!payload.email)
        return throwError(returnMessage("auth", "emailRequired"));
      const password_required = await Authentication.findOne({
        email: payload?.email,
        is_deleted: false,
      }).lean();
      if (password_required?.password) return { password_required: false };
      return { password_required: true };
    } catch (error) {
      logger.error(`Error while getting password required: ${error}`);
      return throwError(error?.message, error?.statusCode);
    }
  };
}

module.exports = AuthService;
