const logger = require("../logger");
const { throwError } = require("../helpers/errorUtil");
const AdminTermAndCondition = require("../models/admintermAndConditionSchema");

class TermAdnConditionService {
  // Add   TermAndCondition
  addTermAndCondition = async (payload) => {
    try {
      const TermAndCondition = await AdminTermAndCondition.create(payload);
      return TermAndCondition;
    } catch (error) {
      logger.error(`Error while add Term And Condition, ${error}`);
      throwError(error?.message, error?.statusCode);
    }
  };
}

module.exports = TermAdnConditionService;
