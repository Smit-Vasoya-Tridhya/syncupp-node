const Notification = require("../models/notificationSchema");
const logger = require("../logger");
const { throwError } = require("../helpers/errorUtil");
const {
  returnMessage,
  invoiceTemplate,
  paginationObject,
} = require("../utils/utils");
const { ObjectId } = require("mongodb");
const fs = require("fs");
const Handlebars = require("handlebars");

const statusCode = require("../messages/english.json");
const Authentication = require("../models/authenticationSchema");
const sendEmail = require("../helpers/sendEmail");
const { sendNotification, eventEmitter } = require("../socket");

class NotificationService {
  // Get Client list  ------   AGENCY API
  addNotification = async (payload, activity_id) => {
    try {
      const {
        client_id,
        assign_to,
        assign_by,
        title,
        assigned_by_name,
        activity_type,
      } = payload;

      let message = `A new call meeting has been scheduled - "${title}" by ${assigned_by_name}.`;

      const newNotification = await Notification.create({
        client: {
          reference_id: client_id,
        },
        assign_to: {
          reference_id: assign_to,
        },
        assign_by: {
          reference_id: assign_by,
        },

        data: {
          reference_id: activity_id,
          activity_type: activity_type,
        },
        message: message,
      });
      eventEmitter("NOTIFICATION", newNotification, [client_id, assign_to]);
      return;
    } catch (error) {
      logger.error(`Error while fetching agencies: ${error}`);
      return throwError(error?.message, error?.statusCode);
    }
  };

  getNotification = async (user, searchObj) => {
    try {
      const { skip, limit } = searchObj;

      let search_key;
      if (user.role.name === "client" || user.role.name === "team_client")
        search_key = "client";
      if (user.role.name === "team_agency") search_key = "assign_to";
      if (user.role.name === "agency") search_key = "assign_to";

      const updateObject = {};
      updateObject[`${search_key}.reference_id`] = user.reference_id._id;

      const notifications = await Notification.find(updateObject, {
        _id: 1,
        message: 1,
        createdAt: 1,
        updatedAt: 1,
        [search_key]: 1,
      })
        .skip(parseInt(skip))
        .limit(parseInt(limit));

      return notifications;
    } catch (error) {
      logger.error(`Error while fetching agencies: ${error}`);
      return throwError(error?.message, error?.statusCode);
    }
  };

  readNotification = async (payload, user) => {
    try {
      const { notification_id } = payload;
      let search_key;
      if (user.role.name === "client" || user.role.name === "team_client")
        search_key = "client";
      if (user.role.name === "team_agency") search_key = "assign_to";
      if (user.role.name === "agency") search_key = "assign_to";

      // Create the update object dynamically
      const updateObject = {};
      updateObject[`${search_key}.reference_id`] = user.reference_id._id;
      updateObject[`${search_key}.is_read`] = true;

      const updatedNotification = await Notification.findOneAndUpdate(
        {
          _id: notification_id,
          [`${search_key}.reference_id`]: user.reference_id._id,
        },
        updateObject,
        { new: true, useFindAndModify: false }
      );

      if (!updatedNotification) {
        // Notification not found
        // Handle accordingly, throw an error or return a response
      }

      return updatedNotification;
    } catch (error) {
      logger.error(`Error while fetching agencies: ${error}`);
      return throwError(error?.message, error?.statusCode);
    }
  };
}

module.exports = NotificationService;
