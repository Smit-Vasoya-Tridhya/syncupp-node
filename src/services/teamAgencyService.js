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
const Agency_Type_Master = require("../models/masters/agencyTypeMasterSchema");
const Role_Master = require("../models/masters/roleMasterSchema");
const Team_Agency = require("../models/teamAgencySchema");
const { paginationObject, getKeywordType } = require("./commonSevice");

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

  // Add Team Member

  add = async (payload, user_id) => {
    try {
      const { email, name, contact_number, role } = payload;

      const teamMember = await Authentication.findOne({ email });

      if (teamMember) {
        return throwError(returnMessage("teamAgency", "emailExist"));
      }

      const newRole = await Role_Master.create({
        name: "agency",
      });

      const teamRole = await Agency_Type_Master.create({
        name: role,
        label: role,
      });

      const teamAgency = await Team_Agency.create({
        role: teamRole._id,
        agency_id: user_id,
      });

      const newTeamMember = await Authentication.create({
        email,
        name,
        contact_number,
        role: newRole._id,
        reference_id: teamAgency._id,
      });

      const invitation_token = crypto.randomBytes(32).toString("hex");
      console.log(invitation_token);
      const encode = encodeURIComponent(email);

      const link = `${process.env.TEAMAGENCY_SETPASSWORD_PATH}?token=${invitation_token}&email=${encode}`;
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
    } catch (error) {
      logger.error(`Error while Team agency register, ${error}`);
      throwError(error?.message, error?.status);
    }
  };

  // Verify Team Mem

  verify = async (payload) => {
    try {
      const { first_name, last_name, email, password, token } = payload;

      const hash_token = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

      const teamMember = await Authentication.findOne({
        email: email,
        invitation_token: hash_token,
      });

      if (!teamMember) {
        return throwError(returnMessage("teamAgency", "invalidToken"));
      }
      const hash_password = await bcrypt.hash(password, 14);
      await Authentication.findOneAndUpdate(
        { email: email },
        {
          first_name,
          last_name,
          email,
          password: hash_password,
          invitation_token: undefined,
        }
      );
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

      const member_exist = await Authentication.findOne(
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

  // getOne Team agency
  getOne = async (payload) => {
    try {
      const memberId = payload;
      const teamMember = await Authentication.findOne(
        {
          _id: memberId,
        },
        { password: 0 }
      );

      if (!teamMember) {
        return throwError(returnMessage("teamAgency", "invalidId"));
      }
      return teamMember;
    } catch (error) {
      logger.error(`Error while get team member, ${error}`);
      throwError(error?.message, error?.status);
    }
  };

  // getOne Team agency
  delete = async (payload) => {
    try {
      const memberId = payload;

      const teamMember = await Authentication.findByIdAndDelete({
        _id: memberId,
      });

      if (!teamMember) {
        return throwError(returnMessage("teamAgency", "invalidId"));
      }
      return;
    } catch (error) {
      logger.error(`Error while Team member  delete, ${error}`);
      throwError(error?.message, error?.status);
    }
  };

  getAll = async (payload, searchObj) => {
    try {
      const user_id = payload;
      const user = await Authentication.findOne({
        _id: user_id,
      }).lean();

      const teamMemberData = await Team_Agency.distinct(
        "_id",
        {
          agency_id: user.reference_id,
        },
        {
          is_deleted: false,
        }
      );

      const teamMemberIdData = teamMemberData.map((id) => id.toHexString());

      const queryObj = { reference_id: teamMemberIdData };

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

      const teamMemberRoleList = await Team_Agency.find({
        _id: { $in: teamMemberIdData },
      }).populate("role");

      const pagination = paginationObject(searchObj);

      console.log(pagination);
      const teamMemberList = await Authentication.find(queryObj)
        .skip(pagination.skip)
        .limit(pagination.resultPerPage)
        .sort(pagination.sort)
        .lean();

      // Counting the total documents
      const count = await Authentication.countDocuments(queryObj);

      // Calculating total pages
      const pages = Math.ceil(count / pagination.resultPerPage);

      // Create a map for quick lookup based on "_id"
      const roleMap = new Map(
        teamMemberRoleList.map((role) => [role._id.toString(), role])
      );

      // Combine the lists
      const combinedList = teamMemberList.map((teamMember) => {
        const matchingRole = roleMap.get(teamMember.reference_id.toString());
        return {
          ...teamMember,
          teamMemberRole: matchingRole || null, // Attach the role or null if not found
        };
      });

      // Create the final object
      const combinedOutput = { teamMemberList: combinedList };

      return {
        combinedOutput,
        pagination: {
          page: pagination.page,
          pages: pages,
          count: count,
        },
        // pageCount:
        //   Math.ceil(
        //     combinedOutput.teamMemberList.length / pagination.resultPerPage
        //   ) || 0,
      };
    } catch (error) {
      logger.error(`Error while Team members, Listing ${error}`);
      throwError(error?.message, error?.status);
    }
  };

  // edit Team Member agency
  editMember = async (payload, userId) => {
    try {
      const memberId = userId;
      const teamMember = await Authentication.findByIdAndUpdate(
        {
          _id: memberId,
        },
        payload,
        { new: true, useFindAndModify: false }
      );

      if (!teamMember) {
        return throwError(returnMessage("teamAgency", "invalidId"));
      }
      return teamMember;
    } catch (error) {
      logger.error(`Error while Team member Edit, ${error}`);
      throwError(error?.message, error?.status);
    }
  };
}

module.exports = TeamAgencyService;
