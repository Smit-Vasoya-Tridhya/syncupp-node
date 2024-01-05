const jwt = require("jsonwebtoken");
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
const Authentication = require("../models/authenticationSchema");
const Role_Master = require("../models/masters/roleMasterSchema");
const Team_Agency = require("../models/teamAgencySchema");
const { paginationObject, getKeywordType } = require("./commonSevice");
const Team_Role_Master = require("../models/masters/teamRoleSchema");
const Team_Client = require("../models/teamClientSchema");

class TeamMemberService {
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

  // Add Team Member

  add = async (payload, user_id) => {
    try {
      const { email, name, contact_number, role } = payload;
      const isEmail = await Authentication.findOne({
        email: email,
        is_deleted: true,
      });
      if (isEmail) {
        return throwError(returnMessage("teamMember", "emailExist"));
      }

      const teamMember = await Authentication.findOne({
        reference_id: user_id,
        is_deleted: true,
      }).populate({
        path: "role",
        model: "role_master",
      });

      let roleKey;
      let TeamModelName;
      let memberOf;
      if (teamMember.role.name === "agency") {
        roleKey = "team_agency";
        TeamModelName = Team_Agency;
        memberOf = "agency_id";
      }
      if (teamMember.role.name === "client") {
        roleKey = "team_client";
        TeamModelName = Team_Client;
        memberOf = "client_id";
      }
      const newMasterRole = await Role_Master.create({
        name: roleKey,
      });

      const teamRole = await Team_Role_Master.create({
        role: role,
      });

      const teamModel = await TeamModelName.create({
        role: teamRole._id,
        [memberOf]: user_id,
      });

      const newTeamMember = await Authentication.create({
        email,
        name,
        contact_number,
        role: newMasterRole._id,
        reference_id: teamModel._id,
      });

      const invitation_token = crypto.randomBytes(32).toString("hex");
      console.log(invitation_token);
      const encode = encodeURIComponent(email);

      const link = `${process.env.TEAM_MEMBER_SETPASSWORD_PATH}?token=${invitation_token}&email=${encode}`;
      const forgot_email_template = forgotPasswordEmailTemplate(link);

      await sendEmail({
        email: email,
        subject: returnMessage("emailTemplate", "forgotPasswordSubject"),
        message: forgot_email_template,
      });

      const hash_token = crypto
        .createHash("sha256")
        .update(invitation_token)
        .digest("hex");

      newTeamMember.invitation_token = hash_token;
      await newTeamMember.save();

      console.log(newTeamMember);
    } catch (error) {
      logger.error(`Error while Team Member register, ${error}`);
      throwError(error?.message, error?.status);
    }
  };

  // Verify Team Member

  verify = async (payload) => {
    try {
      const { first_name, last_name, email, password, token } = payload;

      const hash_token = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

      const teamMember = await Authentication.findOne({
        email: email,
        is_deleted: true,
        invitation_token: hash_token,
      });

      if (!teamMember) {
        return throwError(returnMessage("teamMember", "invalidToken"));
      }
      const hash_password = await bcrypt.hash(password, 14);
      await Authentication.findOneAndUpdate(
        { email: email, is_deleted: true },
        {
          first_name,
          last_name,
          email,
          password: hash_password,
          invitation_token: undefined,
        }
      );
    } catch (error) {
      logger.error(`Error while Team Member verify , ${error}`);
      throwError(error?.message, error?.status);
    }
  };

  // Login Team Member

  login = async (payload) => {
    try {
      const { email, password } = payload;

      if (!email || !password)
        return throwError(
          returnMessage("auth", "emailPassNotFound"),
          statusCode.badRequest
        );

      const member_exist = await Authentication.findOne(
        { email: email, is_deleted: false },
        { invitation_token: 0 }
      ).lean();

      if (!member_exist)
        return throwError(
          returnMessage("teamMember", "memberNotFound"),
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
      logger.error(`Error while Team Member  login, ${error}`);
      throwError(error?.message, error?.status);
    }
  };

  // getMember Team Member

  getMember = async (payload) => {
    try {
      const memberId = payload;
      const teamMember = await Authentication.findOne(
        {
          _id: memberId,
          is_deleted: false,
        },
        { password: 0 }
      )
        .populate({
          path: "role",
          model: "role_master",
          select: "-createdAt -updatedAt",
        })
        .populate({
          path: "reference_id",
          model: "team_agency",
          select: "-createdAt -updatedAt",

          populate: {
            path: "role",
            model: "team_role_master",
            select: "-createdAt -updatedAt",
          },
        });

      if (!teamMember) {
        return throwError(returnMessage("teamMember", "invalidId"));
      }
      return teamMember;
    } catch (error) {
      logger.error(`Error while get team member, ${error}`);
      throwError(error?.message, error?.status);
    }
  };

  // Get All team Members

  getAll = async (payload, searchObj) => {
    try {
      const user_id = payload;
      const teamMember = await Authentication.findOne({
        _id: user_id,
        is_deleted: false,
      }).populate({
        path: "role",
        model: "role_master",
      });

      let roleKey;
      let TeamModelName;
      let memberOf;
      if (teamMember.role.name === "agency") {
        roleKey = "team_agency";
        TeamModelName = Team_Agency;
        memberOf = "agency_id";
      }
      if (teamMember.role.name === "client") {
        roleKey = "team_agency";
        TeamModelName = Team_Client;
        memberOf = "client_id";
      }

      const user = await Authentication.findOne({
        _id: user_id,
        is_deleted: false,
      }).lean();

      const teamMemberData = await TeamModelName.distinct("_id", {
        [memberOf]: user.reference_id,
      });

      const teamMemberIdData = teamMemberData.map((id) => id.toHexString());

      const queryObj = { reference_id: teamMemberIdData, is_deleted: false };

      if (searchObj.search && searchObj.search !== "") {
        queryObj["$or"] = [
          {
            name: {
              $regex: searchObj.search.toLowerCase(),
              $options: "i",
            },
          },
        ];

        const keywordType = getKeywordType(searchObj.search);
        if (keywordType === "number") {
          const numericKeyword = parseInt(searchObj.search);
          queryObj["$or"].push({
            contact_number: numericKeyword,
          });
        }
      }

      const pagination = paginationObject(searchObj);
      const teamMemberList = await Authentication.find(queryObj)
        .populate({
          path: "role",
          model: "role_master",
        })
        .populate({
          path: "reference_id",
          model: roleKey,
          populate: {
            path: "role",
            model: "team_role_master",
          },
        })
        .skip(pagination.skip)
        .limit(pagination.resultPerPage)
        .sort(pagination.sort)
        .lean();

      const count = await Authentication.countDocuments(queryObj); // Counting the total documents

      const pages = Math.ceil(count / pagination.resultPerPage); // Calculating total pages

      return {
        teamMemberList,
        pagination: {
          page: pagination.page,
          pages: pages,
          count: count,
        },
      };
    } catch (error) {
      logger.error(`Error while Team members, Listing ${error}`);
      throwError(error?.message, error?.status);
    }
  };

  // Delete a team member

  deleteMember = async (payload) => {
    try {
      const memberId = payload;

      const teamMember = await Authentication.updateOne(
        { _id: memberId },
        { $set: { is_deleted: true } }
      );

      if (!teamMember) {
        return throwError(returnMessage("teamMember", "invalidId"));
      }
      return;
    } catch (error) {
      logger.error(`Error while Team member  delete, ${error}`);
      throwError(error?.message, error?.status);
    }
  };

  // Edit Team Member

  editMember = async (payload, userId) => {
    try {
      const memberId = userId;
      const teamMember = await Authentication.findOneAndUpdate(
        {
          _id: memberId,
          is_deleted: false,
        },

        payload,
        { new: true, useFindAndModify: false }
      );

      if (!teamMember) {
        return throwError(returnMessage("teamMember", "invalidId"));
      }
      return teamMember;
    } catch (error) {
      logger.error(`Error while Team member Edit, ${error}`);
      throwError(error?.message, error?.status);
    }
  };
}

module.exports = TeamMemberService;
