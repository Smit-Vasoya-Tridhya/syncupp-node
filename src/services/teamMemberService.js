const jwt = require("jsonwebtoken");
const logger = require("../logger");
const { throwError } = require("../helpers/errorUtil");
const {
  returnMessage,
  forgotPasswordEmailTemplate,
  invitationEmail,
  validateEmail,
  passwordValidation,
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
const { ObjectId } = require("mongodb");

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
      const { email, name, contact_number, role, agency_id } = payload;
      const isEmail = await Authentication.findOne({
        email: email,
        is_deleted: false,
      }).populate({
        path: "reference_id",
        model: "team_client",
      });

      const teamMember = await Authentication.findOne({
        _id: user_id,
        is_deleted: false,
      })
        .populate({
          path: "role",
          model: "role_master",
        })
        .lean();

      let roleKey;
      let TeamModelName;
      let memberOf;
      if (teamMember.role.name === "agency") {
        roleKey = "team_agency";
        TeamModelName = Team_Agency;
        memberOf = "agency_id";

        if (isEmail) {
          return throwError(returnMessage("teamMember", "emailExist"));
        }

        if (!role) {
          return throwError(returnMessage("teamMember", "roleRequired"));
        }

        // Get  Role master data
        const getRoleData = await Role_Master.findOne({
          name: roleKey,
        }).lean();

        // Get Team Role master
        const getTeamMemberRoleData = await Team_Role_Master.findOne({
          name: role,
        }).lean();

        // Create Team Member schema data
        const teamModel = await TeamModelName.create({
          role: getTeamMemberRoleData._id,
          [memberOf]: teamMember.reference_id,
        });

        // Create new Team Member
        const newTeamMember = await Authentication.create({
          email,
          name,
          contact_number,
          role: getRoleData._id,
          reference_id: teamModel._id,
          status: "confirm_pending",
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
      }
      if (teamMember.role.name === "client") {
        roleKey = "team_client";
        TeamModelName = Team_Client;
        memberOf = "client_id";

        let link = `${
          process.env.REACT_APP_URL
        }/verify?name=${encodeURIComponent(
          teamMember?.name
        )}&email=${encodeURIComponent(email)}&clientId = ${encodeURIComponent(
          user_id
        )}&agencyId=${encodeURIComponent(agency_id)}`;
        if (!isEmail) {
          if (!agency_id) {
            return throwError(
              returnMessage("teamMember", "agencyIdRequired"),
              statusCode.badRequest
            );
          }

          // Get  Role master data
          const getRoleData = await Role_Master.findOne({
            name: roleKey,
          }).lean();

          // Get Team Role master
          const getTeamMemberRoleData = await Team_Role_Master.findOne({
            name: "team_member",
          }).lean();

          // Create Team Member schema data
          const teamModel = await TeamModelName.create({
            role: getTeamMemberRoleData._id,
            [memberOf]: teamMember.reference_id._id,
            agency_ids: [],
          });

          // Create new Team Member
          await Authentication.create({
            email,
            name,
            contact_number,
            role: getRoleData._id,
            reference_id: teamModel._id,
            status: "confirm_pending",
          });

          link = link + "&redirect=false";
          const invitation_mail = invitationEmail(link, teamMember.name);

          await sendEmail({
            email: email,
            subject: returnMessage("emailTemplate", "invitation"),
            message: invitation_mail,
          });
          return true;
        } else {
          if (isEmail?.reference_id?.agency_ids.includes(agency_id)) {
            return throwError(
              returnMessage("teamMember", "agencyIdAlreadyExists"),
              statusCode.badRequest
            );
          }
          link = link + "&redirect=true";
          const invitation_mail = invitationEmail(link, teamMember.name);
          await sendEmail({
            email: email,
            subject: returnMessage("emailTemplate", "invitation"),
            message: invitation_mail,
          });
          return true;
        }
      }
    } catch (error) {
      logger.error(`Error while Team Member register, ${error}`);
      throwError(error?.message, error?.status);
    }
  };

  // Verify Team Member

  verify = async (payload) => {
    try {
      const {
        first_name,
        last_name,
        email,
        password,
        token,
        agency_id,
        client_id,
        redirect,
        name,
      } = payload;

      if (token) {
        const hash_token = crypto
          .createHash("sha256")
          .update(token)
          .digest("hex");
        const teamMember = await Authentication.findOne({
          email: email,
          invitation_token: hash_token,
        });

        if (!teamMember) {
          return throwError(returnMessage("teamMember", "invalidToken"));
        }
        const hash_password = await bcrypt.hash(password, 14);

        teamMember.first_name = first_name;
        teamMember.last_name = last_name;
        teamMember.email = email;
        teamMember.password = hash_password;
        teamMember.invitation_token = null;
        teamMember.password = hash_password;
        teamMember.status = "confirmed";

        await teamMember.save();
      }

      if (redirect) {
        if (!validateEmail(email))
          return throwError(returnMessage("auth", "invalidEmail"));

        const isClientExist = await Authentication.findOne({
          _id: client_id,
        });

        if (!isClientExist)
          return throwError(returnMessage("default", "default"));

        const teamMemberExist = await Authentication.findOne({
          email,
          is_deleted: false,
        });
        if (!teamMemberExist)
          return throwError(returnMessage("default", "default"));

        const teamMember = await Team_Client.findOne({
          _id: teamMemberExist?.reference_id,
        });
        if (!teamMember) return throwError(returnMessage("default", "default"));

        teamMemberExist.status = "confirmed";
        teamMember.agency_ids = teamMember.agency_ids || [];
        teamMember.agency_ids.push(agency_id);
        await teamMemberExist.save();
        await teamMember.save();
      } else {
        if (!validateEmail(email))
          return throwError(returnMessage("auth", "invalidEmail"));

        if (!passwordValidation(password))
          return throwError(returnMessage("auth", "invalidPassword"));

        const isClientExist = await Authentication.findOne({
          _id: client_id,
          // name: name,
        });

        if (!isClientExist)
          return throwError(returnMessage("default", "default"));

        const teamMemberExist = await Authentication.findOne({
          email,
          is_deleted: false,
          status: "confirm_pending",
        });
        if (!teamMemberExist)
          return throwError(returnMessage("default", "default"));

        const teamMember = await Team_Client.findOne({
          _id: teamMemberExist?.reference_id,
        });
        if (!teamMember) return throwError(returnMessage("default", "default"));

        const hash_password = await bcrypt.hash(password, 14);

        teamMemberExist.first_name = first_name;
        teamMemberExist.last_name = last_name;
        teamMemberExist.email = email;
        teamMemberExist.password = hash_password;
        teamMemberExist.status = "confirmed";
        teamMember.agency_ids = teamMember.agency_ids || [];
        teamMember.agency_ids.push(agency_id);
        await teamMemberExist.save();
        await teamMember.save();
      }
    } catch (error) {
      logger.error(`Error while Team Member verify , ${error}`);
      return throwError(error?.message, error?.statusCode);
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
      return throwError(error?.message, error?.statusCode);
    }
  };

  // getMember Team Member

  getMember = async (user_id, memberId) => {
    try {
      const teamMemberInfo = await Authentication.findOne(
        {
          _id: user_id,
          is_deleted: false,
        },
        { password: 0 }
      )
        .populate({
          path: "role",
          model: "role_master",
          select: "-createdAt -updatedAt",
        })
        .lean();

      let memberOf;
      let teamMemberSchemaName;
      if (teamMemberInfo.role.name === "agency") {
        memberOf = "agency_id";
        teamMemberSchemaName = "team_agencies";
      }
      if (teamMemberInfo.role.name === "client") {
        memberOf = "client_id";
        teamMemberSchemaName = "team_clients";
      }

      const pipeLine = [
        {
          $match: {
            _id: new ObjectId(memberId),
            is_deleted: false,
          },
        },

        {
          $lookup: {
            from: "role_masters",
            localField: "role",
            foreignField: "_id",
            as: "user_type",
            pipeline: [{ $project: { name: 1 } }],
          },
        },
        {
          $addFields: {
            log_after_match: "$$ROOT", // Create a new field for logging
          },
        },
        {
          $unwind: "$user_type",
        },
        {
          $lookup: {
            from: teamMemberSchemaName,
            localField: "reference_id",
            foreignField: "_id",
            as: "member_data",
            pipeline: [{ $project: { role: 1, [memberOf]: 1 } }],
          },
        },

        {
          $unwind: "$member_data",
        },

        {
          $lookup: {
            from: "team_role_masters",
            localField: "member_data.role",
            foreignField: "_id",
            as: "member_role",
            pipeline: [{ $project: { name: 1 } }],
          },
        },
        {
          $unwind: "$member_role",
        },

        {
          $project: {
            _id: 1,
            email: 1,
            user_type: "$user_type.name",
            [memberOf]: "$member_data." + memberOf,
            member_role: "$member_role.name",
            createdAt: 1,
            updatedAt: 1,
            first_name: 1,
            last_name: 1,
            contact_number: 1,
            image_url: 1,
            status: 1,
          },
        },
      ];

      const teamMember = await Authentication.aggregate(pipeLine);
      if (!teamMember) {
        return throwError(returnMessage("teamMember", "invalidId"));
      }
      return teamMember;
    } catch (error) {
      logger.error(`Error while get team member, ${error}`);
      return throwError(error?.message, error?.statusCode);
    }
  };

  // Get All team Members

  getAll = async (payload, searchObj) => {
    try {
      const { agency_id } = searchObj;
      const user_id = payload;
      const teamMember = await Authentication.findOne({
        _id: user_id,
        is_deleted: false,
      })
        .populate({
          path: "role",
          model: "role_master",
        })
        .lean();

      let TeamModelName;
      let memberOf;
      let teamMemberSchemaName;
      if (teamMember.role.name === "agency") {
        TeamModelName = Team_Agency;
        memberOf = "agency_id";
        teamMemberSchemaName = "team_agencies";
      }
      if (teamMember.role.name === "client") {
        TeamModelName = Team_Client;
        memberOf = "client_id";
        teamMemberSchemaName = "team_clients";
      }

      const user = await Authentication.findOne({
        _id: user_id,
        is_deleted: false,
      }).lean();

      let teamMemberData;
      if (teamMember.role.name === "client") {
        if (!agency_id)
          return throwError(
            returnMessage("teamMember", "agencyIdRequired"),
            statusCode.notFound
          );

        teamMemberData = await TeamModelName.distinct("_id", {
          [memberOf]: user.reference_id,
          agency_ids: { $in: [agency_id] },
        }).lean();
      }

      if (teamMember.role.name === "agency") {
        teamMemberData = await TeamModelName.distinct("_id", {
          [memberOf]: user.reference_id,
        }).lean();
      }

      const queryObj = { status: "confirmed" };

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

      const pipeLine = [
        {
          $match: {
            reference_id: { $in: teamMemberData },
            is_deleted: false,
            ...queryObj,
          },
        },
        {
          $lookup: {
            from: "role_masters",
            localField: "role",
            foreignField: "_id",
            as: "user_type",
            pipeline: [{ $project: { name: 1 } }],
          },
        },

        {
          $unwind: "$user_type",
        },
        {
          $lookup: {
            from: teamMemberSchemaName,
            localField: "reference_id",
            foreignField: "_id",
            as: "member_data",
            pipeline: [{ $project: { role: 1, [memberOf]: 1 } }],
          },
        },

        {
          $unwind: "$member_data",
        },

        {
          $lookup: {
            from: "team_role_masters",
            localField: "member_data.role",
            foreignField: "_id",
            as: "member_role",
            pipeline: [{ $project: { name: 1 } }],
          },
        },
        {
          $unwind: "$member_role",
        },

        {
          $project: {
            _id: 1,
            email: 1,
            user_type: "$user_type.name",
            [memberOf]: "$member_data." + memberOf,
            member_role: "$member_role.name",
            member_role_id: "$member_role._id",
            createdAt: 1,
            updatedAt: 1,
            first_name: 1,
            last_name: 1,
            contact_number: 1,
            image_url: 1,
            status: 1,
            name: 1,
          },
        },
      ];

      const teamMemberList = await Authentication.aggregate(pipeLine)
        .skip(pagination.skip)
        .limit(pagination.resultPerPage)
        .sort(pagination.sort);

      const countResult = await Authentication.aggregate(pipeLine).count(
        "count"
      );

      const count = countResult[0] && countResult[0].count;

      if (count !== undefined) {
        // Calculating total pages
        const pages = Math.ceil(count / pagination.resultPerPage);

        return {
          teamMemberList,
          pagination: {
            current_page: pagination.page,
            total_pages: pages,
          },
        };
      }
      return {
        teamMemberList,
        pagination: {
          current_page: pagination.page,
          total_pages: 0,
        },
      };
    } catch (error) {
      logger.error(`Error while Team members, Listing ${error}`);
      return throwError(error?.message, error?.statusCode);
    }
  };

  // Delete a team member

  deleteMember = async (payload) => {
    try {
      const memberId = payload;

      console.log(memberId);
      const teamMember = await Authentication.findOne({
        _id: memberId,
        is_deleted: false,
      })
        .populate({
          path: "role",
          model: "role_master",
        })
        .populate({
          path: "reference_id",
          model: "team_agency",
          populate: {
            path: "role",
            model: "team_role_master",
          },
        })
        .lean();

      let TeamModelName;
      if (teamMember.role.name === "team_agency") {
        TeamModelName = Team_Agency;
      }
      if (teamMember.role.name === "team_client") {
        TeamModelName = Team_Client;
      }

      // Step 1: Delete from Authentication collection
      await Authentication.findByIdAndUpdate(
        { _id: memberId },
        { $set: { is_deleted: true } }
      );

      // Step 2: Delete references in team_role_master collection
      await TeamModelName.findByIdAndUpdate(
        { _id: teamMember?.reference_id?._id },
        { $set: { is_deleted: true } }
      );

      if (!teamMember) {
        return throwError(returnMessage("teamMember", "invalidId"));
      }
      return;
    } catch (error) {
      logger.error(`Error while Team member  delete, ${error}`);
      return throwError(error?.message, error?.statusCode);
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
      return throwError(error?.message, error?.statusCode);
    }
  };
}

module.exports = TeamMemberService;
