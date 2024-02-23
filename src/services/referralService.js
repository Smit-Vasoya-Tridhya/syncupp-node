const logger = require("../logger");
const { throwError } = require("../helpers/errorUtil");
const Configuration = require("../models/configurationSchema");
const Authentication = require("../models/authenticationSchema");

class referralClass {
  checkReferralAvailable = async (user) => {
    try {
      // let config = await Configuration.findOne().lean();
      // let user_data = await Authentication.findById(user._id).lean();
      let [config, user_data] = await Promise.all([
        Configuration.findOne().lean(),
        Authentication.findById(user._id).lean(),
      ]);
      const referralAvailable =
        user_data.total_referral_point >= config.referral.redeem_required_point;

      return { referralAvailable };
    } catch (error) {
      logger.error(`Error while checking referral available: ${error}`);
      throw new Error(error?.message); // Throw error instead of returning it
    }
  };
}

module.exports = referralClass;
