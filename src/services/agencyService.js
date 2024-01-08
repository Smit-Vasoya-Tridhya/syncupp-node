const Agency = require("../models/agencySchema");
const logger = require("../logger");
const { throwError } = require("../helpers/errorUtil");
const { returnMessage } = require("../utils/utils");
const Authentication = require("../models/authenticationSchema");

// Register Agency
class AgencyService {
  agencyRegistration = async (payload) => {
    try {
      return await Agency.create(payload);
    } catch (error) {
      logger.error(`Error while registering the agency: ${error}`);
      return throwError(returnMessage("default", "default"), error?.statusCode);
    }
  };

  // Get Agency profile
  getAgencyProfile = async (payload) => {
    try {
      const user_id = payload;

      const agency = await Authentication.findOne(
        {
          _id: user_id,
          is_deleted: false,
        },

        {
          is_facebook_signup: 0,
          is_google_signup: 0,
          password: 0,
          is_deleted: 0,
          remember_me: 0,
        }
      )
        .populate({
          path: "reference_id",
          model: "agency",
        })
        .lean();

      return agency;
    } catch (error) {
      logger.error(`Error while registering the agency: ${error}`);
      return throwError(returnMessage("default", "default"), error?.statusCode);
    }
  };

  // Update Agency profile
  updateAgencyProfile = async (payload, user_id, reference_id) => {
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
        pin_code,
      } = payload;

      const authData = {
        first_name,
        last_name,
        contact_number,
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
        pin_code,
      };

      const [data, data2] = await Promise.all([
        Authentication.updateOne({ _id: user_id }, { $set: authData }),
        Agency.updateOne({ _id: reference_id }, { $set: agencyData }),
      ]);

      console.log(data);

      return;
    } catch (error) {
      logger.error(`Error while registering the agency: ${error}`);
      return throwError(returnMessage("default", "default"), error?.statusCode);
    }
  };
}

module.exports = AgencyService;
