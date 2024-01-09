const { throwError } = require("../helpers/errorUtil");
const logger = require("../logger");
const Client = require("../models/cllientSchema");
const Role_Master = require("../models/masters/roleMasterSchema");
const {
  validateRequestFields,
  invitationEmail,
  returnMessage,
  paginationObject,
  validateEmail,
  passwordValidation,
} = require("../utils/utils");
const Authentication = require("../models/authenticationSchema");
const sendEmail = require("../helpers/sendEmail");
const AuthService = require("../services/authService");
const authService = new AuthService();
const statusCode = require("../messages/statusCodes.json");

class ClientService {
  // create client for the agency
  createClient = async (payload, agency) => {
    try {
      const { name, email, company_name } = payload;
      validateRequestFields(payload, ["name", "email", "company_name"]);

      if (!validateEmail(email))
        return throwError(returnMessage("auth", "invalidEmail"));

      const role = await Role_Master.findOne({ name: "client" })
        .select("_id")
        .lean();

      const client_exist = await Authentication.findOne({
        email,
        is_deleted: false,
        role: role?._id,
      });

      let link = `${
        process.env.REACT_APP_URL
      }/verify-client?name=${encodeURIComponent(
        agency?.first_name + " " + agency?.last_name
      )}&email=${encodeURIComponent(email)}&agency=${encodeURIComponent(
        agency?._id
      )}`;

      if (!client_exist) {
        const client_obj = {
          company_name,
          copany_website: payload?.company_website,
          address: payload?.address,
          city: payload?.city,
          state: payload?.state,
          country: payload?.country,
          pincode: payload?.pincode,
          title: payload?.title,
          agency_ids: [{ agency_id: agency?._id, status: "inactive" }],
        };
        const new_client = await Client.create(client_obj);
        const client_auth_obj = {
          name,
          email,
          contact_number: payload?.contact_number,
          role: role?._id,
          reference_id: new_client?._id,
          status: "confirm_pending",
        };
        await Authentication.create(client_auth_obj);
        link = link + "&redirect=false";
      } else {
        const client = await Client.findById(client_exist?.reference_id);
        const already_exist = client?.agency_ids.filter(
          (id) =>
            id?.agency_id?.toString() == agency?._id && id?.status == "inactive"
        );

        if (already_exist.length > 0)
          return throwError(returnMessage("agency", "clientExist"));

        link = link + "&redirect=true";
        client.agency_ids = [
          ...client?.agency_ids,
          {
            agency_id: agency?._id,
            status: "inactive",
          },
        ];
        await client.save();
      }
      const invitation_mail = invitationEmail(link, name);

      sendEmail({
        email,
        subject: returnMessage("emailTemplate", "invitation"),
        message: invitation_mail,
      });
      return true;
    } catch (error) {
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

      if (redirect) {
        if (!email || !agency_id)
          return throwError(returnMessage("default", "default"));

        const client_auth = await Authentication.findOne({
          email,
          is_deleted: false,
          status: "confirmed",
          role: role?._id,
        }).lean();

        if (!client_auth)
          return throwError(returnMessage("default", "default"));

        const client = await Client.findById(client_auth?.reference_id).lean();

        const agency_exist = client?.agency_ids.filter(
          (id) => id?.agency_id?.toString() == agency_id
        );

        if (agency_exist.length == 0)
          return throwError(returnMessage("default", "default"));

        await Client.updateOne(
          { _id: client?._id, "agency_ids.agency_id": agency_id },
          { $set: { "agency_ids.$.status": "active" } },
          { new: true }
        );

        return authService.tokenGenerator(client_auth);
      }

      validateRequestFields(payload, [
        "password",
        "email",
        "first_name",
        "last_name",
        "agency_id",
      ]);

      if (!validateEmail(email))
        return throwError(returnMessage("auth", "invalidEmail"));

      if (!passwordValidation(password))
        return throwError(returnMessage("auth", "invalidPassword"));

      const client_exist = await Authentication.findOne({
        email,
        is_deleted: false,
        status: "confirm_pending",
        role: role?._id,
      });

      if (!client_exist) return throwError(returnMessage("default", "default"));

      const client = await Client.findById(client_exist?.reference_id).lean();

      const agency_exist = client?.agency_ids.filter(
        (id) => id?.agency_id?.toString() == agency_id
      );

      if (agency_exist.length == 0)
        return throwError(returnMessage("default", "default"));

      const hash_password = await authService.passwordEncryption({ password });

      await Client.updateOne(
        { _id: client?._id, "agency_ids.agency_id": agency_id },
        { $set: { "agency_ids.$.status": "active" } },
        { new: true }
      );
      client_exist.first_name = first_name;
      client_exist.last_name = last_name;
      client_exist.status = "confirmed";
      client_exist.password = hash_password;
      await client_exist.save();

      return authService.tokenGenerator(client_exist);
    } catch (error) {
      console.log(`Error while verifying client`, error);
      return throwError(error?.message, error?.statusCode);
    }
  };

  // delete the client for the particuar agency
  deleteClient = async (client_id, agency) => {
    try {
      const client = await Client.findById(client_id).lean();
      if (!client)
        return throwError(
          returnMessage("client", "clientNotFound"),
          statusCode.notFound
        );

      const agency_exist = client?.agency_ids.filter(
        (id) => id?.agency_id?.toString() == agency?._id
      );

      if (agency_exist.length == 0)
        return throwError(
          returnMessage("agency", "agencyNotFound"),
          statusCode.notFound
        );

      await Client.updateOne(
        { _id: client?._id, "agency_ids.agency_id": agency?._id },
        { $set: { "agency_ids.$.status": "inactive" } },
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
      const pagination = paginationObject(payload);

      const clients = await Client.distinct("_id", {
        agency_ids: {
          $elemMatch: { agency_id: agency?._id, status: "active" },
        },
      }).lean();

      const query_obj = { reference_id: { $in: clients }, is_deleted: false };

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
        ];
      }
      const [client, totalClients] = await Promise.all([
        Authentication.find(query_obj)
          .select("first_name last_name email name")
          .sort(pagination.sort)
          .skip(pagination.skip)
          .limit(pagination.result_per_page)
          .lean(),
        Authentication.countDocuments(query_obj),
      ]);
      return {
        client,
        page_count: Math.ceil(totalClients / pagination.result_per_page) || 0,
      };
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
        },
        { new: true }
      );

      await Authentication.findByIdAndUpdate(
        client?._id,
        {
          first_name: payload?.first_name,
          last_name: payload?.last_name,
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
          .populate("city", "label")
          .populate("country", "label")
          .populate("state", "label")
          .lean(),
      ]);

      client_auth["client"] = client_data;
      return client_auth;
    } catch (error) {
      logger.error(`Error while fetching client detail: ${error}`);
      return throwError(error?.message, error?.statusCode);
    }
  };
}

module.exports = ClientService;
