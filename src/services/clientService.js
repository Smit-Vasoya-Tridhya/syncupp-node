const { throwError } = require("../helpers/errorUtil");
const logger = require("../logger");
const Client = require("../models/cllientSchema");
const Role_Master = require("../models/masters/roleMasterSchema");
const {
  validateRequestFields,
  invitationEmail,
  returnMessage,
} = require("../utils/utils");
const crypto = require("crypto");
const Authentication = require("../models/authenticationSchema");
const sendEmail = require("../helpers/sendEmail");
const AuthService = require("../services/authService");
const authService = new AuthService();

class ClientService {
  invitationTokenGenerator = () => {
    try {
      const token = crypto.randomBytes(20).toString("hex");
      const hash_token = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");
      return { token, hash_token };
    } catch (error) {
      logger.error(`Error while generating invitation token: ${error}`);
      return throwError(error?.message, error?.statusCode);
    }
  };

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
          agency_id: [{ agency_id: agency?._id, status: "inactive" }],
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
      } else {
        const already_exist = client_exist?.agency_ids.filter(
          (id) =>
            id?.agency_id?.toString() == agency?._id && id?.status == "inactive"
        );

        if (already_exist.length > 0)
          return throwError(returnMessage("agency", "clientExist"));

        link = link + "&redirect=true";
        client_exist.agency_ids = client_exist?.agency_ids?.unshift({
          agency_id: agency?._id,
          status: "inactive",
        });
        await client_exist.save();
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
          (id) => id?.agency_id?.toString() == agency?._id
        );

        if (agency_exist.length == 0)
          return throwError(returnMessage("default", "default"));

        await Client.updateOne(
          { "agency_ids.agency": agency?._id },
          { $set: { "agency_ids.$.status": "active" } }
        );

        return authService.tokenGenerator(client_auth);
      }

      validateRequestFields(payload, [
        "password",
        "email",
        "first_name",
        "last_name",
      ]);
      const client_exist = await Authentication.findOne({ email });
    } catch (error) {
      logger.error(`Error while verifying client: ${error}`);
      return throwError(error?.message, error?.statusCode);
    }
  };
}

module.exports = ClientService;
