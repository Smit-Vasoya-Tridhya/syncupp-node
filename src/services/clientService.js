const { throwError } = require("../helpers/errorUtil");
const logger = require("../logger");
const Client = require("../models/clientSchema");
const Role_Master = require("../models/masters/roleMasterSchema");
const {
  validateRequestFields,
  invitationEmail,
  returnMessage,
  paginationObject,
  validateEmail,
  passwordValidation,
  welcomeMail,
  capitalizeFirstLetter,
} = require("../utils/utils");
const Authentication = require("../models/authenticationSchema");
const sendEmail = require("../helpers/sendEmail");
const AuthService = require("../services/authService");

const authService = new AuthService();
const statusCode = require("../messages/statusCodes.json");
const Team_Agency = require("../models/teamAgencySchema");
const Team_Client = require("../models/teamClientSchema");

class ClientService {
  // create client for the agency
  createClient = async (payload, agency) => {
    try {
      if (agency?.role?.name === "team_agency") {
        const team_agency_detail = await Team_Agency.findById(
          agency?.reference_id
        )
          .populate("role", "name")
          .lean();
        if (team_agency_detail?.role?.name === "admin") {
          agency = await Authentication.findById(team_agency_detail?.agency_id)
            .populate("role", "role")
            .lean();
          agency.created_by = team_agency_detail?._id;
        }
      }
      const { first_name, last_name, email, company_name } = payload;
      validateRequestFields(payload, [
        "first_name",
        "last_name",
        "email",
        "company_name",
      ]);

      if (!validateEmail(email))
        return throwError(returnMessage("auth", "invalidEmail"));

      const role = await Role_Master.findOne({ name: "client" })
        .select("_id")
        .lean();

      const client_exist = await Authentication.findOne({
        email,
        is_deleted: false,
      })
        .populate("role", "name")
        .lean();

      // removed because of the payment integration
      // let link = `${
      //   process.env.REACT_APP_URL
      // }/client/verify?name=${encodeURIComponent(
      //   agency?.first_name + " " + agency?.last_name
      // )}&email=${encodeURIComponent(email)}&agency=${encodeURIComponent(
      //   agency?.reference_id
      // )}`;

      if (!client_exist) {
        const client_obj = {
          company_name,
          company_website: payload?.company_website,
          address: payload?.address,
          city: payload?.city,
          state: payload?.state,
          country: payload?.country,
          pincode: payload?.pincode,
          agency_ids: [
            {
              agency_id: agency?.reference_id,
              status: "payment_pending",
              created_by: agency?.created_by,
            },
          ],
        };
        const new_client = await Client.create(client_obj);
        const client_auth_obj = {
          first_name,
          last_name,
          name:
            capitalizeFirstLetter(first_name) +
            " " +
            capitalizeFirstLetter(last_name),
          email,
          contact_number: payload?.contact_number,
          role: role?._id,
          reference_id: new_client?._id,
          status: "confirm_pending",
        };
        await Authentication.create(client_auth_obj);
      } else {
        if (client_exist?.role?.name !== "client")
          return throwError(returnMessage("auth", "emailExist"));

        const client = await Client.findById(client_exist?.reference_id).lean();
        // const already_exist = client?.agency_ids?.filter(
        //   (id) => id?.agency_id?.toString() == agency?.reference_id
        // );

        client?.agency_ids?.forEach((id, index) => {
          if (
            id?.agency_id?.toString() == agency?.reference_id &&
            id?.status === "deleted"
          ) {
            client?.agency_ids.splice(index, 1);
          } else if (
            id?.agency_id?.toString() == agency?.reference_id.toString() &&
            id?.status != "deleted"
          )
            return throwError(returnMessage("agency", "clientExist"));

          return;
        });

        const client_agencies = client?.agency_ids || [];

        const agency_ids = [
          ...client_agencies,
          {
            agency_id: agency?.reference_id,
            status: "payment_pending",
            created_by: agency?.created_by,
          },
        ];

        await Client.findByIdAndUpdate(
          client?._id,
          { agency_ids },
          { new: true }
        );
      }
      // removed because of the payment is added
      // const invitation_mail = invitationEmail(link, name);

      // await sendEmail({
      //   email,
      //   subject: returnMessage("emailTemplate", "invitation"),
      //   message: invitation_mail,
      // });
      const client = await Authentication.findOne({ email })
        .select("reference_id")
        .lean();

      return {
        ...client,
        referral_points: 0, // this is set to 0 initially but it will update when the referral module imlement
      };
    } catch (error) {
      console.log(error);
      logger.error(`Error while creating client: ${error}`);
      return throwError(error?.message, error?.statusCode);
    }
  };

  // verify client that was invitd by any agency
  verifyClient = async (payload) => {
    try {
      const { email, password, first_name, last_name, redirect, agency_id } =
        payload;
      const role = await Role_Master.findOne({ name: "client" })
        .select("_id")
        .lean();
      const client_auth = await Authentication.findOne({
        email,
        is_deleted: false,
        role: role?._id,
      }).lean();

      if (redirect && client_auth && client_auth?.status === "confirmed") {
        if (!email || !agency_id)
          return throwError(returnMessage("default", "default"));

        const client = await Client.findById(client_auth?.reference_id).lean();

        const agency_exist = client?.agency_ids.filter(
          (id) => id?.agency_id?.toString() == agency_id
        );

        if (agency_exist.length == 0)
          return throwError(returnMessage("agency", "agencyNotFound"));

        agency_exist.forEach((agency) => {
          if (
            agency?.status !== "pending" &&
            agency?.agency_id?.toString() == agency_id
          )
            return throwError(
              returnMessage("agency", "alreadyVerified"),
              statusCode.unprocessableEntity
            );
          else if (
            agency?.status === "deleted" &&
            agency?.agency_id?.toString() == agency_id
          )
            return throwError(
              returnMessage("client", "agencyRemovedBeforeVerify"),
              statusCode.unprocessableEntity
            );
        });

        await Client.updateOne(
          { _id: client?._id, "agency_ids.agency_id": agency_id },
          { $set: { "agency_ids.$.status": "active" } },
          { new: true }
        );

        return;
        // return authService.tokenGenerator(client_auth);
      } else {
        // removed first_name and last_name from the validation
        validateRequestFields(payload, ["password", "email", "agency_id"]);

        if (!validateEmail(email))
          return throwError(returnMessage("auth", "invalidEmail"));

        if (!passwordValidation(password))
          return throwError(returnMessage("auth", "invalidPassword"));

        if (client_auth?.status !== "confirm_pending")
          return throwError(returnMessage("client", "clientNotFound"));

        const client = await Client.findById(client_auth?.reference_id).lean();

        const agency_exist = client?.agency_ids.filter(
          (id) => id?.agency_id?.toString() == agency_id
        );

        if (agency_exist.length == 0)
          return throwError(returnMessage("agency", "agencyNotFound"));

        agency_exist.forEach((agency) => {
          if (
            agency?.status !== "pending" &&
            agency?.agency_id?.toString() == agency_id
          )
            return throwError(
              returnMessage("agency", "alreadyVerified"),
              statusCode.unprocessableEntity
            );
          else if (
            agency?.status === "deleted" &&
            agency?.agency_id?.toString() == agency_id
          )
            return throwError(
              returnMessage("client", "agencyRemovedBeforeVerify"),
              statusCode.unprocessableEntity
            );
        });

        const hash_password = await authService.passwordEncryption({
          password,
        });

        await Client.updateOne(
          { _id: client?._id, "agency_ids.agency_id": agency_id },
          { $set: { "agency_ids.$.status": "active" } },
          { new: true }
        );
        await Authentication.findByIdAndUpdate(
          client_auth?._id,
          {
            first_name,
            last_name,
            status: "confirmed",
            password: hash_password,
          },
          { new: true }
        );

        const welcome_mail = welcomeMail(client_auth?.name);

        await sendEmail({
          email: client_auth?.email,
          subject: returnMessage("emailTemplate", "welcomeMailSubject"),
          message: welcome_mail,
        });
        return;
        // return authService.tokenGenerator(client_exist);
      }
      return throwError(returnMessage("default", "default"));
    } catch (error) {
      console.log(`Error while verifying client`, error);
      return throwError(error?.message, error?.statusCode);
    }
  };

  // delete the client from the particuar agency
  deleteClient = async (client_ids, agency) => {
    try {
      if (agency?.role?.name === "team_agency") {
        const team_agency_detail = await Team_Agency.findById(
          agency?.reference_id
        )
          .populate("role", "name")
          .lean();
        if (team_agency_detail?.role?.name === "admin") {
          agency = await Authentication.findById(team_agency_detail?.agency_id)
            .populate("role", "role")
            .lean();
        }
      }
      const clientIds = await Authentication.distinct("reference_id", {
        _id: { $in: client_ids },
      });

      await Client.updateMany(
        {
          _id: { $in: clientIds },
          "agency_ids.agency_id": agency?.reference_id,
        },
        { $set: { "agency_ids.$.status": "deleted" } },
        { new: true }
      );
      return true;
    } catch (error) {
      logger.error(`Error while deleting the client for agency: ${error}`);
      return throwError(error?.message, error?.statusCode);
    }
  };

  // Get the client ist for the Agency
  clientList = async (payload, agency) => {
    try {
      if (agency?.role?.name === "team_agency") {
        const team_agency_detail = await Team_Agency.findById(
          agency?.reference_id
        )
          .populate("role", "name")
          .lean();
        if (team_agency_detail?.role?.name === "admin") {
          agency = await Authentication.findById(team_agency_detail?.agency_id)
            .populate("role", "name")
            .lean();
        }
      }

      if (!payload?.pagination)
        return await this.clientListWithoutPagination(agency);

      if (
        payload.sort_field &&
        (payload.sort_field === "company_name" ||
          payload.sort_field === "company_website")
      ) {
        payload.sort_field = `reference_id.${payload.sort_field}`;
      }
      const pagination = paginationObject(payload);

      const clients_ids = await Client.distinct("_id", {
        agency_ids: {
          $elemMatch: {
            agency_id: agency?.reference_id,
            status: { $ne: "deleted" },
          },
        },
      }).lean();

      const query_obj = {};

      if (payload?.search && payload?.search !== " ") {
        query_obj["$or"] = [
          {
            first_name: { $regex: payload.search, $options: "i" },
          },
          {
            last_name: { $regex: payload.search, $options: "i" },
          },
          {
            email: { $regex: payload.search, $options: "i" },
          },
          {
            contact_number: { $regex: payload.search, $options: "i" },
          },
          {
            "reference_id.company_name": {
              $regex: payload.search,
              $options: "i",
            },
          },
          {
            "reference_id.company_website": {
              $regex: payload.search,
              $options: "i",
            },
          },
          {
            $and: [
              { "reference_id.agency_ids.$.agency_id": agency?.reference_id },
              {
                "reference_id.agency_ids.$.status": {
                  $regex: payload.search,
                  $options: "i",
                },
              },
            ],
          },
        ];
      }

      const aggrage_array = [
        { $match: { reference_id: { $in: clients_ids }, is_deleted: false } },
        {
          $lookup: {
            from: "clients",
            localField: "reference_id",
            foreignField: "_id",
            as: "reference_id",
            pipeline: [
              {
                $project: {
                  company_name: 1,
                  company_website: 1,
                  agency_ids: 1,
                  _id: 1,
                },
              },
            ],
          },
        },
        { $unwind: "$reference_id" },
        { $match: query_obj },
        {
          $project: {
            first_name: 1,
            last_name: 1,
            email: 1,
            name: 1,
            contact_number: 1,
            createdAt: 1,
            reference_id: {
              company_name: 1,
              company_website: 1,
              agency_ids: 1,
              _id: 1,
            },
          },
        },
      ];
      const [clients, totalClients] = await Promise.all([
        Authentication.aggregate(aggrage_array)
          .sort(pagination.sort)
          .skip(pagination.skip)
          .limit(pagination.result_per_page),
        Authentication.aggregate(aggrage_array),
      ]);

      clients.forEach((client) => {
        const agency_exists = client?.reference_id?.agency_ids?.find(
          (ag) => ag?.agency_id?.toString() == agency?.reference_id
        );
        if (agency_exists) {
          client["status"] = agency_exists?.status;
          client.agency = agency_exists;
        }
        delete client?.reference_id?.agency_ids;
      });

      return {
        clients,
        page_count:
          Math.ceil(totalClients.length / pagination.result_per_page) || 0,
      };
    } catch (error) {
      logger.error(
        `Error While fetching list of client for the agency: ${error}`
      );
      return throwError(error?.message, error?.statusCode);
    }
  };

  // Get the client ist for the Agency without pagination
  clientListWithoutPagination = async (agency) => {
    try {
      let clients;
      if (agency?.role?.name === "team_agency") {
        const agency_detail = await Team_Agency.findById(agency.reference_id);
        clients = await Client.distinct("_id", {
          agency_ids: {
            $elemMatch: {
              agency_id: agency_detail?.agency_id,
              status: "active",
            },
          },
        }).lean();
      } else {
        clients = await Client.distinct("_id", {
          agency_ids: {
            $elemMatch: { agency_id: agency?.reference_id, status: "active" },
          },
        }).lean();
      }
      const aggrage_array = [
        { $match: { reference_id: { $in: clients }, is_deleted: false } },
        {
          $project: {
            first_name: 1,
            last_name: 1,
            email: 1,
            name: { $concat: ["$first_name", " ", "$last_name"] },
            createdAt: 1,
            reference_id: 1,
          },
        },
      ];

      return await Authentication.aggregate(aggrage_array);
    } catch (error) {
      logger.error(
        `Error While fetching list of client for the agency: ${error}`
      );
      return throwError(error?.message, error?.statusCode);
    }
  };

  // Update the client details by client it self
  updateClient = async (payload, client) => {
    try {
      await Client.findByIdAndUpdate(
        client?.reference_id,
        {
          company_name: payload?.company_name,
          company_website: payload?.company_website,
          state: payload?.state,
          city: payload?.city,
          country: payload?.country,
          pincode: payload?.pincode,
          address: payload?.address,
          title: payload?.title,
        },
        { new: true }
      );

      await Authentication.findByIdAndUpdate(
        client?._id,
        {
          first_name: payload?.first_name,
          last_name: payload?.last_name,
          name: payload?.name,
        },
        { new: true }
      );

      return true;
    } catch (error) {
      logger.error(`Error While update client details: ${error}`);
      return throwError(error?.message, error?.statusCode);
    }
  };

  getClientDetail = async (client) => {
    try {
      const [client_auth, client_data] = await Promise.all([
        Authentication.findById(client?._id)
          .select("-password -reset_password_token")
          .lean(),
        Client.findById(client?.reference_id)
          .select("-agency_ids")
          .populate("city", "name")
          .populate("country", "name")
          .populate("state", "name")
          .lean(),
      ]);
      client_auth["client"] = client_data;
      return client_auth;
    } catch (error) {
      logger.error(`Error while fetching client detail: ${error}`);
      return throwError(error?.message, error?.statusCode);
    }
  };

  getAgencies = async (client) => {
    try {
      let client_data, status;
      // if the user role is type of hte team client then we need to provide the access same as a client
      if (client?.role?.name === "team_client") {
        client_data = await Team_Client.findById(client?.reference_id).lean();
        status = "confirmed";
      } else {
        client_data = await Client.findById(client?.reference_id).lean();
        status = "active";
      }

      const agency_array = client_data?.agency_ids?.map((agency) =>
        agency?.status === status ? agency?.agency_id : undefined
      );

      return await Authentication.find({
        reference_id: { $in: agency_array },
        is_deleted: false,
      })
        .select("name reference_id first_name last_name")
        .lean();
    } catch (error) {
      logger.error(`Error while fetching agencies: ${error}`);
      return throwError(error?.message, error?.statusCode);
    }
  };

  // Update Agency profile
  updateClientProfile = async (payload, user_id, reference_id) => {
    try {
      const {
        first_name,
        last_name,
        contact_number,
        company_name,
        company_website,
        no_of_people,
        industry,
        city,
        address,
        state,
        country,
        pincode,
      } = payload;

      const authData = {
        first_name,
        last_name,
        contact_number,
        name:
          capitalizeFirstLetter(first_name) +
          " " +
          capitalizeFirstLetter(last_name),
      };
      const agencyData = {
        company_name,
        company_website,
        no_of_people,
        industry,
        city,
        address,
        state,
        country,
        pincode,
      };

      await Promise.all([
        Authentication.updateOne(
          { _id: user_id },
          { $set: authData },
          { new: true }
        ),
        Client.updateOne(
          { _id: reference_id },
          { $set: agencyData },
          { new: true }
        ),
      ]);

      return;
    } catch (error) {
      logger.error(`Error while registering the agency: ${error}`);
      return throwError(error?.message, error?.statusCode);
    }
  };
}

module.exports = ClientService;
