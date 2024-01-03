const Agency = require("../models/agencySchema");
const logger = require("../logger");
const { throwError } = require("../helpers/errorUtil");
const { returnMessage } = require("../utils/utils");

class AgencyService {
  agencyRegistration = async (payload) => {
    try {
      return await Agency.create(payload);
    } catch (error) {
      logger.error(`Error while registering the agency: ${error}`);
      return throwError(error?.message, error?.statusCode);
    }
  };
}

module.exports = AgencyService;
