const jwt = require("jsonwebtoken");
const logger = require("../logger");
const {
  returnMessage,
  validateRequestFields,
  validateEmail,
  passwordValidation,
} = require("../utils/utils");
const bcrypt = require("bcrypt");
const { throwError } = require("../helpers/errorUtil");
const Authentication = require("../models/authenticationSchema");
const AgencyService = require("../services/agencyService");
const agencyService = new AgencyService();
const Role_Master = require("../models/masters/roleMasterSchema");

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
      return throwError(error?.message, error?.status);
    }
  };

  passwordVerifier = async (payload) => {
    try {
      return await bcrypt.compare(payload.password, payload.encrypted_password);
    } catch (error) {
      logger.error(`Error while password verification: ${error}`);
      return throwError(error?.message, error?.status);
    }
  };

  passwordEncryption = async (payload) => {
    try {
      return await bcrypt.hash(payload.password, 14);
    } catch (error) {
      logger.error(`Error while password encryption: ${error}`);
      return throwError(error?.message, error?.status);
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

      const [agency, encrypted_password, role] = await Promise.resolve([
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
      return throwError(error?.message, error?.status);
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
      return throwError(error?.message, error?.status);
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
      throwError(error?.message, error?.status);
    }
  };
}

module.exports = AuthService;
