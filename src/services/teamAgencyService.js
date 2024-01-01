const jwt = require("jsonwebtoken");
const logger = require("../logger");
const { throwError } = require("../helpers/errorUtil");
const { returnMessage } = require("../utils/utils");
const statusCode = require("../messages/statusCodes.json");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const sendEmail = require("../helpers/sendEmail");
const TeamAgency = require("../models/teamAgencySchema");

class TeamAgencyService {
  // Token generate

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

  // Register

  register = async (payload, req, res) => {
    try {
      const { email, name, contact_no, role } = payload;
      const teamMember = await TeamAgency.findOne({ email });

      if (teamMember) {
        return throwError(
          returnMessage("TeamAgency", "emailExist"),
          statusCode.badRequest
        );
      }

      const newTeamMember = await TeamAgency.create({
        email,
        name,
        contact_no,
        role,
      });

      const reset_password_token = crypto.randomBytes(20).toString("hex");
      const reset_password_url = `${req.protocol}://${req.get(
        "host"
      )}/api/v1/verify-account/${reset_password_token}`;
      const message = `Click on the link to set up your account ${reset_password_url}`;
      await sendEmail({
        email: req.body.email,
        subject: "Invitation to set up your account",
        message: message,
      });

      newTeamMember.reset_password_token = reset_password_token;
      await newTeamMember.save();
    } catch (error) {
      logger.error(`Error while admin login, ${error}`);
      throwError(error?.message, error?.status);
    }
  };

  // Verify

  verify = async (payload, req, res) => {
    try {
      const { first_name, last_name, email, password, token } = payload;
      const teamMember = await TeamAgency.findOne({ email });
      if (!teamMember) {
        return throwError(
          returnMessage("TeamAgency", "registerFirst"),
          statusCode.badRequest
        );
      }
      if (teamMember && teamMember.is_verified === true) {
        return throwError(
          returnMessage("TeamAgency", "passwordAlreadySet"),
          statusCode.badRequest
        );
      }

      if (token !== teamMember.token) {
        return throwError(
          returnMessage("TeamAgency", "invalidToken"),
          statusCode.badRequest
        );
      }

      const hash_password = await bcrypt.hash(password, 10);
      const verifyTeamMember = await TeamAgency.create({
        first_name,
        last_name,
        email,
        password: hash_password,
        is_verified: true,
        token: "",
      });
      await verifyTeamMember.save();
    } catch (error) {
      logger.error(`Error while admin login, ${error}`);
      throwError(error?.message, error?.status);
    }
  };

  // Login

  login = async (payload) => {
    try {
      const { email, password } = payload;

      if (!email || !password)
        return throwError(
          returnMessage("auth", "emailPassNotFound"),
          statusCode.badRequest
        );

      const member_exist = await TeamAgency.findOne({ email }).lean();

      if (!member_exist)
        return throwError(
          returnMessage("teamAgency", "memberNotFound"),
          statusCode.notFound
        );

      const correct_password = await bcrypt.compare(
        password,
        member_exist?.password
      );
      if (!correct_password)
        return throwError(
          returnMessage("auth", "incorrectPassword"),
          statusCode.badRequest
        );

      return this.tokenGenerator(member_exist);
    } catch (error) {
      logger.error(`Error while agency team member login, ${error}`);
      throwError(error?.message, error?.status);
    }
  };
}

module.exports = TeamAgencyService;
