const Notification = require("../models/notificationSchema");
const logger = require("../logger");
const { throwError } = require("../helpers/errorUtil");
const { returnMessage, invoiceTemplate } = require("../utils/utils");
const { ObjectId } = require("mongodb");

const statusCode = require("../messages/english.json");
const Authentication = require("../models/authenticationSchema");
const sendEmail = require("../helpers/sendEmail");

class NotificationService {
  // Get Client list  ------   AGENCY API
  addNotification = async (user) => {
    try {
    } catch (error) {
      logger.error(`Error while fetching agencies: ${error}`);
      return throwError(error?.message, error?.statusCode);
    }
  };
}

module.exports = NotificationService;
