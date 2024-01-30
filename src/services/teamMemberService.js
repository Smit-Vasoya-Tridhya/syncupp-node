const logger = require("../logger");
const { throwError } = require("../helpers/errorUtil");
const {
  returnMessage,
  invitationEmail,
  validateEmail,
  passwordValidation,
  validateRequestFields,
  paginationObject,
} = require("../utils/utils");
const statusCode = require("../messages/statusCodes.json");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const sendEmail = require("../helpers/sendEmail");
const Authentication = require("../models/authenticationSchema");
const Role_Master = require("../models/masters/roleMasterSchema");
const Team_Agency = require("../models/teamAgencySchema");
const Team_Role_Master = require("../models/masters/teamRoleSchema");
const Team_Client = require("../models/teamClientSchema");
const { ObjectId } = require("mongodb");
const Agency = require("../models/agencySchema");
const AuthService = require("./authService");
const authService = new AuthService();

class TeamMemberService {
  // Add Team Member by agency or client
  addTeamMember = async (payload, user) => {
    try {
      validateRequestFields(payload, ["email", "name"]);

      if (user?.role?.name == "agency") {
        return await this.addAgencyTeam(payload, user);
      } else if (user?.role?.name == "client") {
        return await this.addClientTeam(payload, user);
      }
    } catch (error) {
      logger.error(`Error While adding the Team member: ${error}`);
      return throwError(error?.message, error?.status);
    }
  };

  // Add the team member by the Agency it self
  addAgencyTeam = async (payload, user) => {
    try {
      const { email, name, contact_number, role } = payload;
      if (!role || role === "")
        return throwError(returnMessage("teamMember", "roleRequired"));

      const [team_member_exist, team_role, role_for_auth] = await Promise.all([
        Authentication.findOne({
          email,
          is_deleted: false,
        }).lean(),
        Team_Role_Master.findOne({ name: role }).select("_id").lean(),
        Role_Master.findOne({ name: "team_agency" }).lean(),
      ]);

      if (team_member_exist)
        return throwError(returnMessage("teamMember", "emailExist"));

      let invitation_token = crypto.randomBytes(32).toString("hex");

      const link = `${process.env.REACT_APP_URL}/team/verify?agency=${
        user?.first_name + " " + user?.last_name
      }&agencyId=${user?.reference_id}&email=${encodeURIComponent(
        email
      )}&token=${invitation_token}&redirect=false`;

      const team_agency = await Team_Agency.create({
        agency_id: user?.reference_id,
        role: team_role?._id,
      });
      invitation_token = crypto
        .createHash("sha256")
        .update(invitation_token)
        .digest("hex");

      await Authentication.create({
        name,
        status: "confirm_pending",
        email,
        reference_id: team_agency?._id,
        contact_number,
        invitation_token,
        role: role_for_auth?._id,
      });
      const invitation_template = invitationEmail(link, name);

      sendEmail({
        email,
        subject: returnMessage("emailTemplate", "invitation"),
        message: invitation_template,
      });
      return;
    } catch (error) {
      logger.error(`Error While adding the Team member by agency: ${error}`);
      return throwError(error?.message, error?.status);
    }
  };

  // Add the team member for the particular agency by client
  addClientTeam = async (payload, user) => {
    try {
      const { email, name, agency_id, contact_number, role } = payload;
      if (!agency_id || agency_id === "")
        return throwError(returnMessage("teamMember", "agencyIdRequired"));

      if (!role || role === "")
        return throwError(returnMessage("teamMember", "roleRequired"));

      const agency_exist = await Agency.findById(agency_id).lean();
      if (!agency_exist)
        return throwError(
          returnMessage("agency", "agencyNotFound"),
          statusCode?.notFound
        );

      const [team_client_exist, team_role, team_auth_role] = await Promise.all([
        Authentication.findOne({
          email,
          is_deleted: false,
        }).lean(),
        Team_Role_Master.findOne({ name: "team_client" }).lean(),
        Role_Master.findOne({ name: "team_client" }).lean(),
      ]);

      if (!team_client_exist) {
        const new_team_client = await Team_Client.create({
          client_id: user?.reference_id,
          agency_ids: [{ agency_id, status: "requested" }],
          role: team_role?._id,
        });

        await Authentication.create({
          name,
          email,
          contact_number,
          role: team_auth_role?._id,
          reference_id: new_team_client?._id,
          status: "confirm_pending",
        });
        return;
      } else {
        const team_member = await Team_Client.findById(
          team_client_exist?.reference_id
        ).lean();

        const agency_id_exist = team_member?.agency_ids.filter(
          (agency) => agency?.agency_id.toString() === agency_id
        );

        if (agency_id_exist.length > 0)
          return throwError(
            returnMessage("teamMember", "agencyIdAlreadyExists")
          );

        const agency_ids = [
          ...team_member.agency_ids,
          { agency_id, status: "requested" },
        ];

        await Team_Client.findByIdAndUpdate(
          team_client_exist?.reference_id,
          {
            agency_ids,
          },
          { new: true }
        );
      }

      return;
    } catch (error) {
      logger.error(`Error While adding the Team member by client: ${error}`);
      return throwError(error?.message, error?.status);
    }
  };

  // Add Team Member
  // add = async (payload, user_id) => {
  //   try {
  //     const { email, name, contact_number, role, agency_id } = payload;
  //     const isEmail = await Authentication.findOne({
  //       email: email,
  //       is_deleted: false,
  //     }).populate({
  //       path: "reference_id",
  //       model: "team_client",
  //     });

  //     const teamMember = await Authentication.findOne({
  //       _id: user_id,
  //       is_deleted: false,
  //     })
  //       .populate({
  //         path: "role",
  //         model: "role_master",
  //       })
  //       .lean();

  //     let roleKey;
  //     let TeamModelName;
  //     let memberOf;
  //     if (teamMember.role.name === "agency") {
  //       roleKey = "team_agency";
  //       TeamModelName = Team_Agency;
  //       memberOf = "agency_id";

  //       if (isEmail) {
  //         return throwError(returnMessage("teamMember", "emailExist"));
  //       }

  //       if (!role) {
  //         return throwError(returnMessage("teamMember", "roleRequired"));
  //       }

  //       // Get  Role master data
  //       const getRoleData = await Role_Master.findOne({
  //         name: roleKey,
  //       }).lean();

  //       // Get Team Role master
  //       const getTeamMemberRoleData = await Team_Role_Master.findOne({
  //         name: role,
  //       }).lean();

  //       // Create Team Member schema data
  //       const teamModel = await TeamModelName.create({
  //         role: getTeamMemberRoleData._id,
  //         [memberOf]: teamMember.reference_id,
  //       });

  //       // Create new Team Member
  //       const newTeamMember = await Authentication.create({
  //         email,
  //         name,
  //         contact_number,
  //         role: getRoleData._id,
  //         reference_id: teamModel._id,
  //         status: "confirm_pending",
  //       });

  //       const invitation_token = crypto.randomBytes(32).toString("hex");
  //       console.log(invitation_token);
  //       const encode = encodeURIComponent(email);

  //       const link = `${process.env.TEAM_MEMBER_SETPASSWORD_PATH}?name=${name}&email=${encode}&redirect=false&agency=${user_id}`;
  //       const forgot_email_template = forgotPasswordEmailTemplate(link);

  //       await sendEmail({
  //         email: email,
  //         subject: returnMessage("emailTemplate", "forgotPasswordSubject"),
  //         message: forgot_email_template,
  //       });

  //       const hash_token = crypto
  //         .createHash("sha256")
  //         .update(invitation_token)
  //         .digest("hex");

  //       newTeamMember.invitation_token = hash_token;
  //       await newTeamMember.save();
  //       return true;
  //     }
  //     if (teamMember.role.name === "client") {
  //       roleKey = "team_client";
  //       TeamModelName = Team_Client;
  //       memberOf = "client_id";

  //       let link = `${
  //         process.env.REACT_APP_URL
  //       }/team/verify?name=${encodeURIComponent(
  //         teamMember?.name
  //       )}&email=${encodeURIComponent(email)}&clientId=${encodeURIComponent(
  //         user_id
  //       )}&agencyId=${encodeURIComponent(agency_id)}`;
  //       if (!isEmail) {
  //         if (!agency_id) {
  //           return throwError(
  //             returnMessage("teamMember", "agencyIdRequired"),
  //             statusCode.badRequest
  //           );
  //         }

  //         // Get  Role master data
  //         const getRoleData = await Role_Master.findOne({
  //           name: roleKey,
  //         }).lean();

  //         // Get Team Role master
  //         const getTeamMemberRoleData = await Team_Role_Master.findOne({
  //           name: "team_member",
  //         }).lean();

  //         // Create Team Member schema data
  //         const teamModel = await TeamModelName.create({
  //           role: getTeamMemberRoleData._id,
  //           [memberOf]: teamMember.reference_id._id,
  //           agency_ids: [],
  //         });

  //         // Create new Team Member
  //         await Authentication.create({
  //           email,
  //           name,
  //           contact_number,
  //           role: getRoleData._id,
  //           reference_id: teamModel._id,
  //           status: "confirm_pending",
  //         });

  //         link = link + "&redirect=false";
  //         const invitation_mail = invitationEmail(link, teamMember.name);

  //         await sendEmail({
  //           email: email,
  //           subject: returnMessage("emailTemplate", "invitation"),
  //           message: invitation_mail,
  //         });
  //         return true;
  //       } else {
  //         if (isEmail?.reference_id?.agency_ids.includes(agency_id)) {
  //           return throwError(
  //             returnMessage("teamMember", "agencyIdAlreadyExists"),
  //             statusCode.badRequest
  //           );
  //         }
  //         link = link + "&redirect=true";
  //         const invitation_mail = invitationEmail(link, teamMember.name);
  //         await sendEmail({
  //           email: email,
  //           subject: returnMessage("emailTemplate", "invitation"),
  //           message: invitation_mail,
  //         });
  //         return true;
  //       }
  //     }
  //   } catch (error) {
  //     logger.error(`Error while Team Member register, ${error}`);
  //     throwError(error?.message, error?.status);
  //   }
  // };

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
      } = payload;

      if (token && !redirect) {
        const hash_token = crypto
          .createHash("sha256")
          .update(token)
          .digest("hex");
        const teamMember = await Authentication.findOne({
          email: email,
          invitation_token: hash_token,
          is_deleted: false,
        });

        if (!teamMember) {
          return throwError(returnMessage("teamMember", "invalidToken"));
        }
        const hash_password = await authService.passwordEncryption({
          password,
        });

        teamMember.first_name = first_name;
        teamMember.last_name = last_name;
        teamMember.email = email;
        teamMember.invitation_token = undefined;
        teamMember.password = hash_password;
        teamMember.status = "confirmed";

        await teamMember.save();
        return;
      } else if (client_id && client_id !== "") {
        if (!validateEmail(email))
          return throwError(returnMessage("auth", "invalidEmail"));

        const team_auth_role = await Role_Master.findOne({
          name: "team_client",
        }).lean();

        const client_team_member = await Authentication.findOne({
          email,
          role: team_auth_role?._id,
        }).lean();

        if (!client_team_member)
          return throwError(
            returnMessage("auth", "userNotFound"),
            statusCode.notFound
          );

        const team_client = await Team_Client.findById(
          client_team_member?.reference_id
        ).lean();

        if (!team_client)
          return throwError(
            returnMessage("auth", "userNotFound"),
            statusCode.notFound
          );

        const agency_id_exist = team_client?.agency_ids.filter(
          (agency) =>
            agency?.agency_id.toString() === agency_id &&
            agency?.status === "requested"
        );

        if (agency_id_exist.length === 0)
          return throwError(returnMessage("agency", "agencyNotFound"));

        if (redirect) {
          await Team_Client.updateOne(
            { _id: team_client?._id, "agency_ids.agency_id": agency_id },
            { $set: { "agency_ids.$.status": "confirmed" } },
            { new: true }
          );
          return authService.tokenGenerator(client_team_member);
        } else {
          const hash_password = await authService.passwordEncryption({
            password,
          });
          await Authentication.findByIdAndUpdate(client_team_member?._id, {
            first_name,
            last_name,
            password: hash_password,
            status: "confirmed",
          });

          await Team_Client.updateOne(
            { _id: team_client?._id, "agency_ids.agency_id": agency_id },
            { $set: { "agency_ids.$.status": "confirmed" } },
            { new: true }
          );
          return authService.tokenGenerator(client_team_member);
        }
      }
      return throwError(returnMessage("default", "default"));
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
            name: 1,
            contact_number: 1,
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

  // // Get All team Members

  // getAll = async (payload, searchObj) => {
  //   try {
  //     const { agency_id } = searchObj;
  //     const user_id = payload;
  //     const teamMember = await Authentication.findOne({
  //       _id: user_id,
  //       is_deleted: false,
  //     })
  //       .populate("role", "name")
  //       .lean();

  //     let TeamModelName;
  //     let memberOf;
  //     let teamMemberSchemaName;
  //     if (teamMember.role.name === "agency") {
  //       TeamModelName = Team_Agency;
  //       memberOf = "agency_id";
  //       teamMemberSchemaName = "team_agencies";
  //     }
  //     if (teamMember.role.name === "client") {
  //       TeamModelName = Team_Client;
  //       memberOf = "client_id";
  //       teamMemberSchemaName = "team_clients";
  //     }

  //     const user = await Authentication.findOne({
  //       _id: user_id,
  //       is_deleted: false,
  //     }).lean();

  //     let teamMemberData;
  //     if (teamMember.role.name === "client") {
  //       if (!agency_id)
  //         return throwError(
  //           returnMessage("teamMember", "agencyIdRequired"),
  //           statusCode.notFound
  //         );

  //       teamMemberData = await TeamModelName.distinct("_id", {
  //         [memberOf]: user.reference_id,
  //         agency_ids: { $in: [agency_id] },
  //       }).lean();
  //     }

  //     if (teamMember.role.name === "agency") {
  //       teamMemberData = await TeamModelName.distinct("_id", {
  //         [memberOf]: user.reference_id,
  //       }).lean();
  //     }

  //     const queryObj = { status: "confirmed" };

  //     if (searchObj.search && searchObj.search !== "") {
  //       queryObj["$or"] = [
  //         {
  //           name: {
  //             $regex: searchObj.search.toLowerCase(),
  //             $options: "i",
  //           },
  //         },
  //         {
  //           contact_number: {
  //             $regex: searchObj.search.toLowerCase(),
  //             $options: "i",
  //           },
  //         },
  //       ];

  //       // const keywordType = getKeywordType(searchObj.search);
  //       // if (keywordType === "number") {
  //       //   const numericKeyword = parseInt(searchObj.search);
  //       //   queryObj["$or"].push({
  //       //     contact_number: numericKeyword,
  //       //   });
  //       // }
  //     }

  //     const pagination = paginationObject(searchObj);

  //     const pipeLine = [
  //       {
  //         $match: {
  //           reference_id: { $in: teamMemberData },
  //           is_deleted: false,
  //           ...queryObj,
  //         },
  //       },
  //       {
  //         $lookup: {
  //           from: "role_masters",
  //           localField: "role",
  //           foreignField: "_id",
  //           as: "user_type",
  //           pipeline: [{ $project: { name: 1 } }],
  //         },
  //       },

  //       {
  //         $unwind: "$user_type",
  //       },
  //       {
  //         $lookup: {
  //           from: teamMemberSchemaName,
  //           localField: "reference_id",
  //           foreignField: "_id",
  //           as: "member_data",
  //           pipeline: [{ $project: { role: 1, [memberOf]: 1 } }],
  //         },
  //       },

  //       {
  //         $unwind: "$member_data",
  //       },

  //       {
  //         $lookup: {
  //           from: "team_role_masters",
  //           localField: "member_data.role",
  //           foreignField: "_id",
  //           as: "member_role",
  //           pipeline: [{ $project: { name: 1 } }],
  //         },
  //       },
  //       {
  //         $unwind: "$member_role",
  //       },

  //       {
  //         $project: {
  //           _id: 1,
  //           email: 1,
  //           user_type: "$user_type.name",
  //           [memberOf]: "$member_data." + memberOf,
  //           member_role: "$member_role.name",
  //           member_role_id: "$member_role._id",
  //           createdAt: 1,
  //           updatedAt: 1,
  //           first_name: 1,
  //           last_name: 1,
  //           contact_number: 1,
  //           image_url: 1,
  //           status: 1,
  //           name: 1,
  //         },
  //       },
  //     ];

  //     const [teamMemberList, total_team_members] = await Promise.all([
  //       Authentication.aggregate(pipeLine)
  //         .skip(pagination.skip)
  //         .limit(pagination.resultPerPage)
  //         .sort(pagination.sort),
  //       Authentication.aggregate(pipeLine),
  //     ]);

  //     return {
  //       teamMemberList,
  //       page_count:
  //         Math.ceil(total_team_members.length / pagination.resultPerPage) || 0,
  //     };
  //   } catch (error) {
  //     logger.error(`Error while Team members, Listing ${error}`);
  //     return throwError(error?.message, error?.statusCode);
  //   }
  // };

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

  editMember = async (payload, team_member_id) => {
    try {
      const team_member_exist = await Authentication.findById(team_member_id)
        .populate("role", "name")
        .where("is_deleted")
        .ne(true)
        .lean();
      if (!team_member_exist || team_member_exist?.role?.name !== "team_agency")
        return throwError(
          returnMessage("teamMember", "userNotFound"),
          statusCode.notFound
        );
      let role;
      if (payload?.role && payload?.role !== "")
        role = await Team_Role_Master.findOne({ name: payload?.role })
          .select("_id")
          .lean();

      await Authentication.findByIdAndUpdate(
        team_member_id,
        {
          name: payload?.name,
          contact_number: payload?.contact_number,
        },
        { new: true }
      );
      await Team_Agency.findByIdAndUpdate(
        team_member_exist?.reference_id,
        { role: role?._id },
        { new: true }
      );
      return;
    } catch (error) {
      logger.error(`Error while Team member Edit, ${error}`);
      return throwError(error?.message, error?.statusCode);
    }
  };

  // Get all team members by Agency and by client
  getAllTeam = async (payload, user) => {
    try {
      const pagination = paginationObject(payload);
      let search_obj = {};
      if (payload?.search && payload?.search !== "") {
        search_obj["$or"] = [
          { name: { $regex: payload.search, $options: "i" } },
          { first_name: { $regex: payload.search, $options: "i" } },
          { last_name: { $regex: payload.search, $options: "i" } },
          { email: { $regex: payload.search, $options: "i" } },
          { contact_number: { $regex: payload.search, $options: "i" } },
          { status: { $regex: payload.search, $options: "i" } },
        ];
      }
      if (user?.role?.name === "agency") {
        if (payload?.for_client) {
          const query_obj = { "agency_ids.agency_id": user?.reference_id };
          if (payload?.client_id) query_obj.client_id = payload?.client_id;

          const team_clients_ids = await Team_Client.distinct("_id", query_obj);

          const [teams, total_teams] = await Promise.all([
            Authentication.find({
              reference_id: { $in: team_clients_ids },
              is_deleted: false,
              ...search_obj,
            })
              .select(
                "name first_name last_name email contact_number status createdAt reference_id"
              )
              .sort(pagination.sort)
              .skip(pagination.skip)
              .limit(pagination.result_per_page)
              .lean(),
            Authentication.countDocuments({
              reference_id: { $in: team_clients_ids },
              is_deleted: false,
              ...search_obj,
            }),
          ]);

          return {
            teamMemberList: teams,
            page_count:
              Math.ceil(total_teams / pagination.result_per_page) || 0,
          };
        }
        const team_agency_ids = await Team_Agency.distinct("_id", {
          agency_id: user?.reference_id,
        });
        const [teams, total_teams] = await Promise.all([
          Authentication.find({
            reference_id: { $in: team_agency_ids },
            is_deleted: false,
            ...search_obj,
          })
            .select(
              "name first_name last_name email contact_number status createdAt reference_id"
            )
            .populate({
              path: "reference_id",
              model: "team_agency",
              populate: {
                path: "role",
                model: "team_role_master",
                select: "name",
              },
            })
            .sort(pagination.sort)
            .skip(pagination.skip)
            .limit(pagination.result_per_page)
            .lean(),
          Authentication.countDocuments({
            reference_id: { $in: team_agency_ids },
            is_deleted: false,
            ...search_obj,
          }),
        ]);
        return {
          teamMemberList: teams,
          page_count: Math.ceil(total_teams / pagination.result_per_page) || 0,
        };
      } else if (user?.role?.name === "client") {
        const team_client_ids = await Team_Client.distinct("_id", {
          client_id: user?.reference_id,
          "agency_ids.agency_id": payload?.agency_id,
        });

        const [teams, total_teams] = await Promise.all([
          Authentication.find({
            reference_id: { $in: team_client_ids },
            is_deleted: false,
            ...search_obj,
          })
            .populate({
              path: "reference_id",
              model: "team_client",
              match: { "agency_ids.agency_id": payload?.agency_id },
            })
            .sort(pagination.sort)
            .skip(pagination.skip)
            .limit(pagination.result_per_page)
            .lean(),
          Authentication.countDocuments({
            _id: { $in: team_client_ids },
            is_deleted: false,
            ...search_obj,
          }),
        ]);
        return {
          teamMemberList: teams,
          page_count: Math.ceil(total_teams / pagination.result_per_page) || 0,
        };
      }
    } catch (error) {
      logger.error(`Error while fetching all team members: ${error}`);
      return throwError(error?.message, error?.statusCode);
    }
  };

  getProfile = async (team) => {
    try {
      const team_detail = await Authentication.findById(team?._id)
        .select("-password")
        .lean();
      let team_reference;
      if (team?.role?.name === "team_agency") {
        team_reference = await Team_Agency.findById(team?.reference_id)
          .populate("city", "name")
          .populate("state", "name")
          .populate("country", "name")
          .lean();
      } else if (team?.role?.name === "team_client") {
        team_reference = await Team_Client.findById(team?.reference_id)
          .populate("city", "name")
          .populate("state", "name")
          .populate("country", "name")
          .lean();
      }

      team_detail.reference_id = team_reference;
      return team_detail;
    } catch (error) {
      logger.error(`Error while getting team profile: ${error}`);
      return throwError(error?.message, error?.statusCode);
    }
  };
}

module.exports = TeamMemberService;
