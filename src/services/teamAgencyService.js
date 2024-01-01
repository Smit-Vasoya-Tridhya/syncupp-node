const jwt = require("jsonwebtoken");
const logger = require("../logger");
const { throwError } = require("../helpers/errorUtil");
const { returnMessage } = require("../utils/utils");
const statusCode = require("../messages/statusCodes.json");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const sendEmail = require("../helpers/sendEmail");
const TeamAuthAgency = require("../models/authenticationSchema");
const Agency_Type_Master = require("../models/masters/agencyTypeMasterSchema");
const Role_Master = require("../models/masters/roleMasterSchema");

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
      const { email, name, contact_number, role } = payload;

      const teamMember = await TeamAuthAgency.findOne({ email });

      if (teamMember) {
        return throwError(
          returnMessage("teamAgency", "emailExist"),
          statusCode.badRequest
        );
      }

      const newRole = await Role_Master.create({
        name: "agency",
      });

      const newTeamMember = await TeamAuthAgency.create({
        email,
        name,
        contact_number,
        role: newRole._id,
        reference_id: "65928863d4a6b3861d7a5fbb",
      });

      const invitation_token = crypto.randomBytes(20).toString("hex");
      const invitation_token_url = `${req.protocol}://${req.get(
        "host"
      )}/api/v1/verify-account/${invitation_token}`;

      const message = `Click on the link to set up your account ${invitation_token_url}`;
      await sendEmail({
        email: req.body.email,
        subject: "Invitation to set up your account",
        message: message,
      });

      newTeamMember.invitation_token = invitation_token;
      await newTeamMember.save();
    } catch (error) {
      logger.error(`Error while Team agency register, ${error}`);
      throwError(error?.message, error?.status);
    }
  };

  // Verify

  verify = async (payload, req, res) => {
    try {
      const { first_name, last_name, email, password, token } = payload;

      const teamMember = await TeamAuthAgency.findOne({ email });

      if (!teamMember) {
        return throwError(
          returnMessage("teamAgency", "registerFirst"),
          statusCode.badRequest
        );
      }

      if (teamMember && teamMember.is_verified === true) {
        return throwError(
          returnMessage("teamAgency", "passwordAlreadySet"),
          statusCode.badRequest
        );
      }

      console.log(token);
      console.log(teamMember.invitation_token);
      if (token !== teamMember.invitation_token) {
        return throwError(
          returnMessage("teamAgency", "invalidToken"),
          statusCode.badRequest
        );
      }

      const hash_password = await bcrypt.hash(password, 10);
      const verifyTeamMember = await TeamAuthAgency.findOneAndUpdate(
        { email: email },
        {
          first_name,
          last_name,
          email,
          password: hash_password,
        }
      );

      await verifyTeamMember.save();
    } catch (error) {
      logger.error(`Error while Team agency verify , ${error}`);
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

      const member_exist = await TeamAuthAgency.findOne(
        { email: email },
        { invitation_token: 0 }
      ).lean();

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
      logger.error(`Error while Team agency  login, ${error}`);
      throwError(error?.message, error?.status);
    }
  };

  // forgotPassword

  forgotPassword = async (payload, req, res) => {
    const { email } = payload;

    console.log(email);
    const teamMember = await TeamAuthAgency.findOne(
      { email: email },
      { password: 0 }
    );
    if (!teamMember) {
      return throwError(returnMessage("teamAgency", "emailNotFound"));
    }
    if (teamMember) {
      const reset_password_token = crypto.randomBytes(20).toString("hex");
      const reset_password_url = `${req.protocol}://${req.get(
        "host"
      )}/api/v1/password-reset/${reset_password_token}`;
      const message = `Your password reset token is :- \n\n ${reset_password_url}  \n\n IF you have not requested this mail then , Please ignore`;
      await sendEmail({
        email: req.body.email,
        subject: "Team member panel Password Recovery",
        message: message,
      });
      teamMember.reset_password_token = reset_password_token;
      await teamMember.save();
    }
  };

  //resetPassword

  resetPassword = async (payload, req, res) => {
    const { token, email } = payload;
    const teamMember = await TeamAuthAgency.findOne(
      {
        email: email,
      },
      {
        password: 0,
      }
    );
    if (token !== teamMember.reset_password_token) {
      return throwError(returnMessage("teamAgency", "invalidToken"));
    }

    if (!teamMember) {
      return throwError(returnMessage("teamAgency", "emailNotFound"));
    } else {
      const hash_password = await bcrypt.hash(req.body.newPassword, 10);
      teamMember.password = hash_password;
      teamMember.reset_password_token = "";
      await teamMember.save();
    }
  };

  //updatePassword
  updatePassword = async (payload, req, res) => {
    const teamMember = await TeamAuthAgency.findOne({
      email: "hhhh@gmail.com",
    });
    if (teamMember) {
      const is_match = await bcrypt.compare(
        req.body.oldPassword,
        teamMember.password
      );

      console.log(is_match);
      if (!is_match) {
        return throwError(returnMessage("teamAgency", "passwordNotMatch"));
      }
      const hash_password = await bcrypt.hash(req.body.newPassword, 10);
      teamMember.password = hash_password;
      await teamMember.save();
    }
  };
}

module.exports = TeamAgencyService;
