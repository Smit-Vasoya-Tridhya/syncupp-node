const logger = require("../logger");
const { throwError } = require("../helpers/errorUtil");
const Configuration = require("../models/configurationSchema");
const Authentication = require("../models/authenticationSchema");

class referralClass {
  checkReferralAvailable = async (user) => {
    try {
      let config = await Configuration.findOne().lean();
      let user_data = await Authentication.findById(user._id).lean();

      if (
        user_data.total_referral_point >= config.referral.reedem_requred_point
      ) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      logger.error(`Error while checking referral available: ${error}`);
      return throwError(error?.message, error?.statusCode);
    }
  };
}

module.exports = referralClass;
